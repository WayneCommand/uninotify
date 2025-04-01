# Uninotify

This is a unified message push service based on Cloudflare Workers, which can simply push messages in real time using an API.

## Cloudflare

### init

```shell
apt install npm nodejs

npm install wrangler -g

wrangler init --from-dash uninotify
```

### next

Navigate to the new directory `cd uninotify`

Run the development server `npm run start`

Deploy your application `npm run deploy`

Read the documentation https://developers.cloudflare.com/workers
Stuck? Join us at https://discord.gg/cloudflaredev


### API Docs

# API Docs

## Wechat Notification API

This API allows you to send notifications to Wechat using the Uninotify service.

### Endpoint

`POST https://notify.waynecommand.com/wechat`

### Headers

- `Content-Type: application/json`
- `Authorization: Bearer {apiKey}`

### Request Body

The request body must be a JSON object containing the following fields:

| Field      | Type   | Description                                      |
|------------|--------|--------------------------------------------------|
| platform   | string | (Optional) The platform to use. Defaults to `iyuu`. Valid options are `ftqq` and `iyuu`. |
| apiToken   | string | (Optional) The API token to use. Defaults to the environment variable. |
| title      | string | (Optional) The title of the notification. Defaults to "Server Notify". |
| content    | string | (Optional) The content of the notification. Defaults to "This is a default message, please check your server status." |


## Client

### JetBrains Http Tool

```shell
### notify service
POST https://notify.waynecommand.com/wechat
Content-Type: application/json
Authorization: Bearer apikey

{
  "platform": "", # default use iyuu
  "apiToken": "", # default use env
  "title": "这是一个新消息",
  "content": "这是消息内容"
}
```

### curl

```shell
curl -X POST --location "https://notify.waynecommand.com/wechat" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer apikey" \
    -d "{
          \"platform\": \"\",
          \"apiToken\": \"\",
          \"title\": \"this is a new notify\"
        }"
```




## Roadmap

- [ ] Add more platforms
