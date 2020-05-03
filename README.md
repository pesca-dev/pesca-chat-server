# Socket Chat Server

This is the server component of the socket chat app. It is build on NodeJS and SocketIO and due to the asynchronous I/O of NodeJS it allows a huge amount of concurrent connections.

## System Dependencies

-   NodeJS

## Installation instructions

### Installation on Linux

**Via Terminal:**

```sh
# Node.js v14.x

# Using Ubuntu
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

# Using Debian, as root
curl -sL https://deb.nodesource.com/setup_14.x | bash -
apt-get install -y nodejs
```

### Installation on macOS

**Via [Homebrew](https://brew.sh/index_de) (recommended):**

```sh
brew install node
```

**Via terminal:**

```sh
curl "https://nodejs.org/dist/latest/node-${VERSION:-$(wget -qO- https://nodejs.org/dist/latest/ | sed -nE 's|.*>node-(.*)\.pkg</a>.*|\1|p')}.pkg" > "$HOME/Downloads/node-latest.pkg" && sudo installer -store -pkg "$HOME/Downloads/node-latest.pkg" -target "/"
```

### Installation on Windows

**Download Binaries from:**

```http
https://nodejs.org/en/#download
```

## Setup

Just clone this Git repository to a location of your choice. Then `cd` into the directory and issue the following commands:

```sh
$ npm run build # this build all JS files from their TypeScript source
$ npm run start # this starts the server
```

After this, you can see all the needed information in the console.
