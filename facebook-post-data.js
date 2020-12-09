var axios = require('axios');
var FormData = require('form-data');

let cheerio = require('cheerio');

module.exports = (post_url) => {
    return new Promise((resolve, reject) => {
        if (/(http[s]?:\/\/(?:www.)?facebook\.(?:com|nl)\/.+)/.test(post_url)) {
            var data = new FormData();
            data.append('URLz', post_url);

            var config = {
                method: 'post',
                url: 'https://fbdown.net/download.php',
                headers: {
                    'Cookie': '__cfduid=d60fd637971a2abd681b99ca2d3b5c2801607470211',
                    ...data.getHeaders()
                },
                data: data
            };

            axios(config)
                .then(function (response) {
                    let html = response.data,
                        $ = cheerio.load(html);
                    // console.log(html);
                    let video_link = $('#hdlink').attr('href');

                    if (typeof video_link !== "undefined" && video_link !== null) {
                        console.log('Found video', video_link);
                        resolve(video_link);
                    } else {
                        reject('video not found');
                    }
                })
                .catch(reject);
        } else {
            reject('invalid url');
        }
    })
};