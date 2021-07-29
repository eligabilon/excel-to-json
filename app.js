	var express = require('express'); 
    var app = express(); 
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var xlstojson = require("xls-to-json-lc");
    var xlsxtojson = require("xlsx-to-json-lc");
    
    app.use(bodyParser.json());  

    var storage = multer.diskStorage({ //copia o xls/xlsx para a pasta /uploads com o nome Ex: file-1627518560471.xlsx
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });

    var upload = multer({ //captura o arquivo copiado e armazena na var upload para trabalhar com ele na próxima função
                    storage: storage,
                    fileFilter : function(req, file, callback) { //file filter
                        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                            return callback(new Error('Wrong extension type'));
                        }
                        callback(null, true);
                    }
                }).single('file');

    //API de upload de arquivo
    app.post('/upload', function(req, res) {
        var exceltojson;
        upload(req,res,function(err){
            if(err){
                res.json({error_code:1,err_desc:err});
                return;
            }
            //Obten informação do arquivo
            if(!req.file){
                res.json({error_code:1,err_desc:"Nenhum arquivo"});
                return;
            }
            //Verifica a extenção do arquivo
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            console.log(req.file.path);
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, //saida do json caso necessite setar aqui - output.json
                    lowerCaseHeaders:false
                }, function(err,result){
                    if(err) {
                        return res.json({error_code:1,err_desc:err, data: null});
                    } 
                    res.json(result);
                });
            } catch (e){
                res.json({error_code:1,err_desc:"Arquivo excel corrompido"});
            }
        })
    });
	
	app.get('/',function(req,res){
		res.sendFile(__dirname + "/index.html");
	});

    app.listen('3333', function(){
        console.log('running on 3333...');
    });
