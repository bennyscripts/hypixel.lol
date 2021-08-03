# hypixel.lol
A node.js sharex file uploader with multiple domains, upload keys, embeds and a pretty config generator.  
This is a great base to start a small image host.  

### Installation
- Download either the source code or a release.
- Open a terminal and run `npm install` to install all dependencies.
- Run `npm start` to start the node.

### Setup
To add domains you need to first open `src/data/domains.json` and add the domains to the list.  
Then you need to point the domains in the list to the server hosting hypixel.lol.  
Finally, all domains pointed should update and they should be working.  

To use subdomains you need to setup a wildcard subdomain (`*`) in each domain.  
This allowes anything to be put infront of the domain. Allowing custom subdomains, even ones that other people may already be using.

### Copyright
hypixel.lol is solely owned and developed by Benny. All rights go towards the developers.

