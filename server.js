const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()

app.get('/', function (req, res)
{
    res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/video/:videoname', function (req, res)
{
    console.log(req.params.videoname);

    if (req.params.videoname == null)
    {
        res.send("please mention video name")
        return;
    } else
    {
        const path = `assets/${req.params.videoname}.mp4`;
        //const path = 'assets/burger.mp4'
        const stat = fs.statSync(path)
        const fileSize = stat.size
        const range = req.headers.range

        if (range)
        {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1]
                ? parseInt(parts[1], 10)
                : fileSize - 1

            const chunksize = (end - start) + 1
            const file = fs.createReadStream(path, { start, end })
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }

            res.writeHead(206, head)
            file.pipe(res)
        } else
        {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head)
            fs.createReadStream(path).pipe(res)
        }
    }

})

const PORT = process.env.PORT || 5000

app.listen(
    PORT,
    console.log(
        `Server running on port ${PORT}`
    )
)