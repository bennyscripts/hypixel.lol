const express = require('express')
const bodyParser = require('body-parser')
const serveIndex = require('serve-index')
const randomstring = require("randomstring")
const randomColor = require('randomcolor')
const formidable = require('formidable')
const filesizejs = require('filesize')
const fs = require('fs')
const path = require('path')
const app = express()
const getSomeCoolEmojis = require("get-some-cool-emojis")

var appDir = path.dirname(require.main.filename).toString().replace("src", "")
var allowedExtensions = ["png", "jpg", "jpeg", "gif", "webm", "mp4", "mov"]

var config = JSON.parse(fs.readFileSync(__dirname + "/data/config.json"))
var uploadKeyLength = config["uploadkeylength"]
var uploadKeys = config["uploadkeys"]
var mainDomain = config["maindomain"]

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/config", (req, res) => {
    res.sendFile(appDir + "/public/config.html")
})

app.get("/:file", (req, res) => {
    var file = req.params["file"]
    
    fs.readdirSync(__dirname + '/raw/').forEach( function (item, index) {
        if (file == item.replace("." + item.split(".")[1], "")) {
            var filePath = 'raw/' + item
            var fileUrl = "https://"+mainDomain+"/raw/" + item
            var fileSize = filesizejs(fs.statSync(__dirname + "/" + filePath).size, {base: 10})
            var extension = item.split(".")[1]

            var uploads = JSON.parse(fs.readFileSync(__dirname + "/data/uploads.json"))
            var user = uploads[item]["user"]

            var oEmbed = uploads[item]["oembed"]
            var embedTitle = uploads[item]["embed"]["title"].replace("{filename}", file).replace("{filesize}", fileSize).replace("{username}", user)
            var embedDescription = uploads[item]["embed"]["description"].replace("{filename}", file).replace("{filesize}", fileSize).replace("{username}", user)
            var embedColour = uploads[item]["embed"]["colour"]

            if (extension == "webm" || extension == "mp4" || extension == "mov") {
                res.send(`<!DOCTYPE html> <html lang="en"> <head> <title>hypixel.lol — ${file}</title> <link type="application/json+oembed" href="${oEmbed}"> <meta name="twitter:card" content="player"> <meta name="twitter:player" content="${fileUrl}"> <meta name="twitter:player:width" content="1280"> <meta name="twitter:player:height" content="720"> <meta name="twitter:title" content="${embedTitle}"> <meta name="twitter:description" content="${embedDescription}"> <meta name="theme-color" content="${embedColour}"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <link rel="stylesheet" href="assets/style.css"> <link rel="stylesheet" href="https://use.typekit.net/obf6rgz.css"> </head> <body> <div class="center"> <div class="card"> <div class="card-content"> <h2 class="card-title">${item} (${fileSize})</h2> <video style="max-width: 100%; height: auto; border-radius: 10px;" controls> <source src="${filePath}"> </video> </div></div></div></body> </html>`)
            } else {
                res.send(`<!DOCTYPE html> <html lang="en"> <head> <title>hypixel.lol — ${file}</title> <link type="application/json+oembed" href="${oEmbed}"> <meta name="twitter:card" content="photo"> <meta name="twitter:image" content="${fileUrl}"> <meta name="twitter:title" content="${embedTitle}"> <meta name="twitter:description" content="${embedDescription}"> <meta name="theme-color" content="${embedColour}"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <link rel="stylesheet" href="assets/style.css"> <link rel="stylesheet" href="https://use.typekit.net/obf6rgz.css"> </head> <body> <div class="center"> <div class="card"> <div class="card-content"> <h2 class="card-title">${item} (${fileSize})</h2> <img src="${filePath}" style="max-width: 100%; height: auto; border-radius: 10px;"> </div></div></div></body> </html> `)                        
            }
        }
    })
})

app.get("/raw/:file", (req, res) => {
    var file = req.params["file"]
    
    fs.readdirSync(__dirname + '/raw/').forEach( function (item, index) {
        if (file == item) {
            var filePath = __dirname + '/raw/' + item
            res.sendFile(filePath)
        }
    })
})

app.post("/upload", (req, res) => {
    var domains = JSON.parse(fs.readFileSync(__dirname + "/data/domains.json"))
    var form = new formidable.IncomingForm()
    form.parse(req, function (err, fields, files) {
        var uploadKey = fields["upload-key"]
        var user = uploadKey.substring(0, uploadKey.length - (uploadKeyLength + 1))

        var embedAuthor = fields["embed-author"]
        var embedTitle = fields["embed-title"]
        var embedDescription = fields["embed-description"]
        var embedColour = fields["embed-colour"]
        var randomColour = randomColor()
        var subdomain = fields["subdomain"]

        if (embedColour.toLowerCase() == "random") {embedColour = randomColour}
        if (embedTitle == null || embedTitle == "") {embedTitle = " "}
        if (embedDescription == null || embedDescription == "") {embedDescription = " "}
        if (embedColour == null || embedColour == "") {embedColour = "#ff0000"}
        if (subdomain == undefined) {subdomain = ""}

        embedAuthor = embedAuthor.replace("{randomemoji}", getSomeCoolEmojis(1))

        var hash = randomstring.generate(8)
        var extension = path.extname(files.file.name).replace(".", "")
        console.log(extension)

        if (uploadKeys.includes(uploadKey)) {
            if (allowedExtensions.includes(extension)) {
                fs.rename(files.file.path, __dirname + '/raw/' + hash + "." + extension, function (err) {
                    if (err) throw err

                    fs.writeFileSync(__dirname + "/raw/" + hash + "-embed.json", `{"version":"1.0","type":"link","author_name":"${embedAuthor}"}`)

                    fs.readFile(__dirname + '/data/uploads.json', function (error, data) {
                        if (error) throw error
                        var uploads = JSON.parse(data)
                
                        uploads[`${hash}.${extension}`] = {}
                        uploads[`${hash}.${extension}`]["user"] = user
                        uploads[`${hash}.${extension}`]["url"] = `https://${mainDomain}/${hash}`
                        uploads[`${hash}.${extension}`]["oembed"] = `https://${mainDomain}/raw/${hash}-embed.json`
                        uploads[`${hash}.${extension}`]["embed"] = {}
                        uploads[`${hash}.${extension}`]["embed"]["title"] = embedTitle
                        uploads[`${hash}.${extension}`]["embed"]["description"] = embedDescription
                        uploads[`${hash}.${extension}`]["embed"]["colour"] = embedColour
        
                        fs.writeFile(__dirname + '/data/uploads.json', JSON.stringify(uploads, null, 4), error2 => {if (error2) throw error2})
                    })

                    if (domains.includes(fields["domain"])) {
                        if (subdomain != "") {
                            res.write(`https://${subdomain}.${fields["domain"]}/${hash}`)
                        } else {
                            res.write(`https://${fields["domain"]}/${hash}`)
                        }
                    } else {
                        if (subdomain != "") {
                            res.write(`https://${subdomain}.${mainDomain}/${hash}`)
                        } else {
                            res.write(`https://${mainDomain}/${hash}`)
                        }
                    }
                    res.end()
                  })
            } else {
                res.write("Can't upload that file.")
                res.end()
            }
        } else {
            res.write("Invalid upload key.")
            res.end()
        }
    })
})

app.get("/api/domains", (request, response) => {
    var domains = JSON.parse(fs.readFileSync(__dirname + "/data/domains.json"))
    response.json(domains)
})

app.get("/api/uploads/:uploadkey", (request, response) => {
    var user = request.params["uploadkey"].substring(0, request.params["uploadkey"].length - (uploadKeyLength + 1))
    var uploads = JSON.parse(fs.readFileSync(__dirname + "/data/uploads.json"))
    var uploads2 = []
    Object.keys(uploads).forEach(index => {
        if (uploads[index]["user"] == user) {
            uploads2.push(uploads[index]["url"])
        }
    })
    response.json(uploads2)
})

app.listen(config["nodeserverport"], () => {
    console.log("listening on :"+config["nodeserverport"])
})

app.use(express.static(appDir + "/public/"))
app.use('assets/', serveIndex(appDir + '/assets/'))

// test