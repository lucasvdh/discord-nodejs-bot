let cheerio = require('cheerio');
let request = require('request');

module.exports = (post_url) => {
    return new Promise((resolve, reject) => {
        if (/(http[s]?:\/\/(?:www.)?instagram\.com\/p\/\w{11}\/)/.test(post_url)) {
            request(post_url, (error, response, html) => {
                if (!error) {
                    let $ = cheerio.load(html);

                    //basic data from the meta tags
                    let image_link = $('meta[property="og:image"]').attr('content');
                    let video_link = $('meta[property="og:video"]').attr('content');
                    let file = $('meta[property="og:type"]').attr('content');
                    let url = $('meta[property="og:url"]').attr('content');
                    let title = $('meta[property="og:title"]').attr('content');

                    resolve({title, url, file, link: {video: video_link, image: image_link}});
                } else {
                    reject('could not fetch page');
                }
            });
        } else {
            reject('invalid url');
        }
    })
};