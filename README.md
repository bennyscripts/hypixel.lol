# hypixel.lol
A node.js sharex file uploader with multiple domains, upload keys, embeds and a pretty config generator.  
This is a great base to start a small image host.  

### Installation
- Download either the source code or a release.
- Open a terminal and run `npm install` to install all dependencies.
- Configure the config in `src/data/config.json`
- Run `npm start` to start the node.

### Setup
To add domains you need to first open `src/data/domains.json` and add the domains to the list.  
Then you need to point the domains in the list to the server hosting hypixel.lol.  
Finally, all domains pointed should update and they should be working.  

To use subdomains you need to setup a wildcard subdomain (`*`) in each domain.  
This allowes anything to be put infront of the domain. Allowing custom subdomains, even ones that other people may already be using.

### Config
The config may seem a little confusing at first.  
Here is a list of all the keys in the config with their meaning.  

- `maindomain` : This is the main domain, if a domain is not set in the config it fallsback to this.  
- `uploadkeylength` : How many characters are after the username in the upload key.  
- `uploadkeys` : A list of the upload keys. Format: `{username}_{key}`. The part after the underscore must be the same length as uploadkeylength.  
- `nodeserverport` : The port for the server.

### Copyright
hypixel.lol is solely owned and developed by Benny. All rights go towards the developers.

