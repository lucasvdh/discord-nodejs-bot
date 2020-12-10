var axios = require('axios');
var FormData = require('form-data');

let cheerio = require('cheerio');

const getFBDown = (facebookUrl) => {
    return new Promise((resolve, reject) => {
        var data = new FormData();
        data.append('URLz', facebookUrl);

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
                    resolve(video_link);
                } else {
                    reject('video_not_found');
                }
            })
            .catch(reject);
    });
}

const findFirstPostLink = (facebookUrl) => {
    return new Promise((resolve, reject) => {
        axios.get(facebookUrl).then(response => {
            let html = response.data,
                $ = cheerio.load(html);
            // console.log(html);
            let twitterPlayerContent = $('meta[name="twitter:player"]').attr('content');

            if (typeof twitterPlayerContent !== "undefined" && twitterPlayerContent !== null) {
                let facebookURLMatches = twitterPlayerContent.match(/(http[s]?:\/\/(?:www.)?facebook\.(?:com|nl)\/(?!plugins).+)/);

                if (facebookURLMatches !== null) {
                    resolve(facebookURLMatches[1]);
                } else {
                    reject('twitter_player_not_found');
                }
            } else {
                reject('post_not_found');
            }
        }).catch(reject);
    });
}

module.exports = (postUrl) => {
    return new Promise((resolve, reject) => {
        if (/(http[s]?:\/\/(?:www.)?facebook\.(?:com|nl)\/.+)/.test(postUrl)) {
            getFBDown(postUrl).then(resolve).catch(error => {
                if (error === 'video_not_found') {
                    findFirstPostLink(postUrl).then(firstPostLink => {
                        console.log('firstPostLink', firstPostLink)
                        getFBDown(firstPostLink).then(resolve).catch(reject);
                    }).catch(reject);
                }
            })

        } else {
            reject('invalid_url');
        }
    })
};