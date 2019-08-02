const request = require('request');
const iconv = require('iconv-lite');
const config = require('config');
const async = require('async');

var req = request.defaults({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'ko,en-US;q=0.8,en;q=0.6'
    },
    jar: true,
    gzip: true,
    followAllRedirects: true,
    encoding: null
});

var requestMainPage = function (result, callback) {
    var option = {
        uri: 'https://etoland.co.kr/',
        method: 'GET',
    };

    req(option, function (err, response, body) {
        result.response = response;
        result.body = body;

        console.log("Request Main Page");
        callback(err, result);
    });
};

var requestLoginPage = function (result, callback) {
    var authConfig = config.get('auth');
    var option = {
        uri: 'https://etoland.co.kr/bbs/login_check2.php',
        method: 'POST',
        form: {
            url: 'https://etoland.co.kr',
            mb_id: authConfig.id,
            mb_password: authConfig.pw
        },
        headers: {
            'Referer': 'http://etoland.co.kr/'
        },
    };

    req(option, function (err, response, body) {
        result.response = response;
        result.body = iconv.decode(Buffer.from(body, 'binary'), 'euc-kr');
        result.data.login_result = result.body;

        console.log("Request Login Page");
        if (!err && result.body.indexOf("location.replace('https://etoland.co.kr');") < 0) {
            //console.log(result.body);
            callback("Login Fail!", result);
        } else {
            callback(err, result);
        }
    });
};

var requestAttendPage = function (result, callback) {
    var option = {
        uri: 'http://etoland.co.kr/check/index.php',
        method: 'GET',
    };

    req(option, function (err, response, body) {
        result.response = response;
        result.body = body;

        console.log("Request Attend Page");
        callback(err, result);
    });
};

var requestAttendUpdatePage = function (result, callback) {
    var option = {
        uri: 'http://etoland.co.kr/check/attendance-update.php',
        method: 'POST',
        form: {
            at_memo: iconv.encode("포인트충전소에서 포인트를 적립해보세요", 'euc-kr'),
            at_memo2: "../../bbs/board.php?bo_table=point1",
            clicks: "1"
        },
    };

    req(option, function (err, response, body) {
        result.response = response;
        result.body = iconv.decode(Buffer.from(body, 'binary'), 'euc-kr');
        result.data.attend_result = result.body;

        console.log("Request Attend Update Page");
        if (!err && result.body.indexOf('출석체크완료') < 0) {
            callback("Attend fail", result);
        } else {
            callback(err, result);
        }
    });
};

exports.handler = function (event, context, callback) {
    async.waterfall([
        function (callback) {
            callback(null, { data: {} });
        },
        requestMainPage,
        requestLoginPage,
        requestAttendPage,
        requestAttendUpdatePage,
    ], function (err, result) {
        console.log({err: err, data: result.data});

        if (callback) {
            callback(null);
        }
    });
};
