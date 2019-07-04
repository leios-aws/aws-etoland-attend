var cheerio = require('cheerio');
var request = require('request-promise');
var iconv = require('iconv-lite');
var fs = require('fs');
var config = require('config');

var htmlLogging = false;

exports.handler = function(event, context, callback) {
    loginConfig = config.get('etoland');

    var mainPage = {
        uri: 'https://etoland.co.kr/',
        method: 'GET',
        qs: {
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6'
        },
        jar: true,
        gzip: true,
        encoding: null
    }
    var loginPage = {
        uri: 'https://etoland.co.kr/bbs/login_check2.php',
        method: 'POST',
        form: {
            url: 'https://etoland.co.kr', 
            mb_id: loginConfig.id, 
            mb_password: loginConfig.pw
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6',
            'Referer': 'http://etoland.co.kr/'
        },
        jar: true,
        gzip: true,
        encoding: null
    }
    var attendPage = {
        uri: 'http://etoland.co.kr/check/index.php',
        method: 'GET',
        qs: {
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6'
        },
        jar: true,
        gzip: true,
        encoding: null
    }
    var attendUpdatePage = {
        uri: 'http://etoland.co.kr/check/attendance-update.php',
        method: 'POST',
        form: {
            at_memo: iconv.encode("포인트충전소에서 포인트를 적립해보세요", 'euc-kr'), 
            at_memo2: "../../bbs/board.php?bo_table=point1", 
            clicks: "1"
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6'
        },
        jar: true,
        gzip: true,
        encoding: null
    }

    request(mainPage).then(function(html){
        var $ = cheerio.load(html);

        if (htmlLogging) {
            fs.writeFileSync('main.html', html, 'binary');
        }

        return request(loginPage);
    }).then(function(html) {
        var $ = cheerio.load(html);

        if (htmlLogging) {
            fs.writeFileSync('login.html', html, 'binary');
        }

        return request(attendPage);
    }).then(function(html){
        var $ = cheerio.load(html);

        if (htmlLogging) {
            fs.writeFileSync('attend.html', html, 'binary');
        }

        return request(attendUpdatePage);
    }).then(function(html){
        var $ = cheerio.load(html);

        if (htmlLogging) {
            fs.writeFileSync('attend-update.html', html, 'binary');
        }
        console.log(iconv.decode(Buffer.from(html, 'binary'), 'euc-kr'));
    }).catch(function(error) {
        if (error) {throw error};
    });

    if (callback) {
        callback(null, 'Success');
    }
};
