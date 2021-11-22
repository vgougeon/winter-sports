# Sports Tour
## What is this ?
Sports Tour is a 3D online game on the browser. This project contains the API with server codes, a frontend with user interface code, and a library that contains the game logic.

### **Technologies** テクノロジ
- **NX** : *build framework*
- **BABYLON.JS** : *game & render engine*
- **React** : *Front end framework*
- **Node** : *Server runtime*
- **socket.io** : *web socket integration*
- **TypeScript** : *type safe javascript*
  
### **Deployment** デプロイメント
Development server :
- **START API** : nx serve api
- **START Front end** : nx serve game

The project doesn't require a database yet

### **Hosting** ホスチグ
This part contains precise indication on how to use the project on a linux environment

*Documentation :*

- Install Debian 11
- Prepare the webhook for automatic deployment on update
  - Install node
    - curl -fsSL https://deb.nodesource.com/setup_17.x | bash -
    - apt-get install -y nodejs
    - npm install pm2 -g
  - ssh-keygen
    - /root/.ssh/id_rsa
    - copy public key
    - add to github ssh keys
  - apt-get install git
    - cd /var/project
    - git clone git@github.com:vgougeon/winter-sports.git
  - apt-get install webhook
    - webhook is a simple webserver listening to webhooks
  - create hooks.json