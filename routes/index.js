var express = require('express');
var session = require('express-session');
var mysql = require('sync-mysql');
var router = express.Router();

var connection = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1q2w3e4r!',
    database: 'oyrtest'
}

router.use(session({
    secret: '1!2@3#4$5%',
    resave: false,
    saveUninitialized: true
}));

var connectDB = new mysql(connection);

/* GET home page. */
router.get('/login', function(req, res) {
  res.render('login', { title: '로그인' });
});

router.get('/apply', function(req, res) {
    res.render('apply', { title: '지원하기'});
});

router.get('/admin', function(req, res) {
    if(!req.session.seId || !req.session.userAuthority || req.session.userAuthority == 0) {
        console.log('권한 없음');
        res.send('권한 없음');
    } 
    else {
        var sApplicant = connectDB.query("SELECT stdName FROM APPLY;");
        res.render('admin', {
            title: '관리자',
            applicant: sApplicant
     });
    }
});

router.post('/login', function(req, res) {
    if(req.body.id == '' || req.body.pw == '') {
        res.send('<script type="text/javascript">alert("아이디와 비번을 모두 입력해주세요!"); document.location.replace("/login");</script>');
    }
    else {
        if(!req.session.seId || !req.session.userAuthority) {
            var inputId = req.body.id;
            var inputPw = req.body.pw;
            req.session.seId = inputId;

            var sql = "SELECT userAuthority FROM USER WHERE userId='"+inputId+"' AND userPassword='"+inputPw+"';";
            const result = connectDB.query(sql);
            console.log(result);

            if(result.length <= 0) {
                var resinfo = 0;
                req.session.userAuthority = resinfo;
                res.send('<script type="text/javascript">alert("존재하지 않는 사용자입니다."); document.location.replace("/login");</script>');
            }
            else {
                var resinfo = result[0].userAuthority;
                req.session.userAuthority = resinfo;
            }

            if(resinfo == 0) {
                console.log('권한 없음');
                res.send('권한 없음');
            }
            else {
                res.redirect('/admin');
            }
        }
        else {
            console.log('권한 없음');
            res.send('권한 없음');
        }
    }
});

router.post('/apply', function(req, res) {
    var instdName = req.body.stdname;
    var instdMajor = req.body.stdmajor;
    var instdNum = req.body.stdnum;
    var instdPhone = req.body.stdphone;
    var instdEmail = req.body.stdemail;
    var instdMil = req.body.stdmil == 'on'? true : false;
    var inapply1 = req.body.applyarea1;
    var inapply2 = req.body.applyarea2;

    if(instdName == '' || instdMajor == '' || instdNum == '' || instdPhone == '' || instdEmail == '' || inapply1 == '' || inapply2 == '') {
        //모두 빠짐없이 작성할 것.
        res.send('<script type="text/javascript">alert("모두 빠짐없이 작성해 주세요!"); document.location.replace("/apply");</script>');
    }
    else {
        var sql = "INSERT INTO APPLY VALUES('"+instdName+"', '"+instdMajor+"', '"+instdNum+"', '"+instdPhone+"', '"+instdEmail+"', '"+inapply1+"', '"+inapply2+"', "+instdMil+");"
        res.send('<script type="text/javascript">alert("제출 완료!"); document.location.replace("/login");</script>');
        connectDB.query(sql);
    }
});

module.exports = router;
