/**
 * https://www.brainysoft.cn   扫描控件官方网站,如需更多文档帮助请访问官网
 * version: 1.0.0
 */
var ScanOnWeb = function () {
    var self = this;

    //扫描配置参数
    self.scaner_work_config = {
        "showUI": false, //是否显示扫描控件工作界面
        "dpi_x": 300, //dpi 分辨率x
        "dpi_y": 300, //dpi 分辨率y
        "deviceIndex": 0, //选中的扫描设备索引
        "showDialog": false, //是否显示设备内置对话框
        "autoFeedEnable": true, //是否使用自动进纸器(需要设备支持才能正常工作)
        "autoFeed": false, //是否自动装填纸张(需要设备支持才能正常工作)
        "dupxMode": false, //是否使用双面扫描模式(需要设备支持才能正常工作)
        "autoDeskew": false, //是否使用自动纠偏模式(需要设备支持才能正常工作)
        "autoBorderDetection": false, //是否使用自动边框检测(需要设备支持才能正常工作)
        "colorMode": "RGB", //色彩模式,RGB为彩色模式,BW是黑白模式 ,GRAY是灰色模式
        "transMode": "memory" //数据传输模式,memory,file,native 这三种配置值,默认为memory模式，大部分设备都是使用这种模式
    };

    //通过连接多个websocket server端口返回一个可用的websocket连接对象
    self.getConnectedServer=function(wssUrls) {
        return new Promise(function(resolve, reject) {
            var server = new WebSocket(wssUrls[0]);
            server.onopen = function() {
                resolve(server);
            }
            server.onerror = function(err) {
                reject(err);
            }
        }
        ).then(function(server) {
            //console.log("连接服务器成功!")
            //找到了可用websocket服务器端口
            self.initWebsocketCallback(server);

            //发送一个获取扫描设备列表的命令,询问本地计算机安装了多少个扫描设备的驱动程序
            self.loadDevices();

            return server;
        }
        , function(err) {
            //如果连接失败,则尝试连接其他端口
            if (wssUrls.length>1) {
                return self.getConnectedServer(wssUrls.slice(1));
            }
        }
        );
    }

    //尝试检测websocket哪个端口可以成功连接
    self.tryConnect=function() {
        var wssUrls = ["ws://127.0.0.1:1001","ws://127.0.0.1:2001","ws://127.0.0.1:3001","ws://127.0.0.1:4001","ws://127.0.0.1:5001"];
        self.getConnectedServer(wssUrls);
    }

    //初始化websocket相关的函数绑定
    self.initWebsocketCallback=function(server) {
        self.h5socket=server;
        self.h5socket.onerror=self.onSocketError;
        self.h5socket.onmessage=self.onSocketMessage;
    }

    self.h5socket=null; 
    self.tryConnect();//尝试连接websocket服务器,注意连接成功哪个是通过回调实现的
    self.imageCount=0;//扫描结果图像总数

    self.onSocketError = function(event) {    
        alert("无法连接扫描服务程序,请检查扫描服务程序是否已经启动！");
        console.log("WebSocket error: " + event.data);
    };


    //判断回调函数是否存在
    self.isCallbackExist = function (f) {
        if (!f || typeof f == 'undefined' || f == undefined) {
            return false;
        }
        if (true == (typeof f === 'function')) {
            return true;
        } else {
            return false;
        }
    };

    self.onSocketMessage = function (event) {
        var msg = JSON.parse(event.data);
        //console.log(msg);
        switch (msg.cmd_type) {
            case "getDevicesList": {
                //获取设备信息列表返回结果                
                if (self.isCallbackExist(self.onGetDevicesListEvent)) {
                    self.onGetDevicesListEvent(msg);
                }
                break;
            }
            case "scanComplete": {
                //扫描完成
                self.imageCount=msg.imageCount;  
                if (self.isCallbackExist(self.onScanFinishedEvent)) {
                    self.onScanFinishedEvent(msg);
                }
                break;
            }
            case "selectScanDevice":{
                //选择扫描设备结果
                self.scaner_work_config.deviceIndex = msg.currentIndex; //当前选中的设备索引
                self.scaner_work_config.showDialog=msg.showDialog; //是否显示设备内置对话框
                self.scaner_work_config.autoFeedEnable=msg.autoFeedEnable; //是否使用自动进纸器(需要设备支持才能正常工作)
                self.scaner_work_config.autoFeed=msg.autoFeed;//是否自动装填纸张(需要设备支持才能正常工作)
                self.scaner_work_config.dupxMode=msg.dupxMode; //是否使用双面扫描模式(需要设备支持才能正常工作)
                self.scaner_work_config.autoDeskew=msg.autoDeskew; //是否使用自动纠偏模式(需要设备支持才能正常工作)
                self.scaner_work_config.autoBorderDetection=msg.autoBorderDetection; //是否使用自动边框检测(需要设备支持才能正常工作)

                if (self.isCallbackExist(self.onSelectScanDeviceEvent)) {
                    self.onSelectScanDeviceEvent(msg);
                }
                break;
            }
            case "getImageCount": {
                //获取扫描图片数量
                self.imageCount=msg.imageCount;  
                if (self.isCallbackExist(self.onGetImageCountEvent)) {
                    self.onGetImageCountEvent(msg);
                } 
                break;
            } 
            case "getAllImage": {
                //获取所有图片
                self.imageCount=msg.imageCount;  
                if (self.isCallbackExist(self.onGetAllImageEvent)) {
                    self.onGetAllImageEvent(msg);
                }
                break;
            }
            case "getImageById":{
                //获取某一页图片的base64编码数据
                self.imageCount=msg.imageCount;  
                if (self.isCallbackExist(self.onGetImageByIdEvent)) {
                    self.onGetImageByIdEvent(msg);
                }
                break;
            }
            case "loadImageFromUrl":{
                //从URL加载图片
                self.imageCount=msg.imageCount;  
                if (self.isCallbackExist(self.onLoadImageFromUrlEvent)) {
                    self.onLoadImageFromUrlEvent(msg);
                }
                break;
            }
            case "rotateImage":{
                //旋转图片
                self.imageCount=msg.imageCount;  
                if (self.isCallbackExist(self.onRotateImageEvent)) {
                    self.onRotateImageEvent(msg);
                }
                break;
            }
            case "getImageSize":{
                //获取图片尺寸
                self.imageCount=msg.imageCount;  
                if (self.isCallbackExist(self.onGetImageSizeEvent)) {
                    self.onGetImageSizeEvent(msg);
                }
                break;
            }
        }
    };

    //通过websocket发送数据给webscoket服务端
    self.sendWebSocketCommand = function (commandData) {
        try {
            if (self.h5socket.readyState === 1) {
                self.h5socket.send(JSON.stringify(commandData));
            } else {
                alert("发送扫描指令失败！请刷新页面或者检查托盘扫描程序是否已经正常运行!");
            }
        } catch (e) {
            alert("发送扫描指令失败！" + e);
        }
    };

    //设置授权信息
    self.setLicenseKey=function(licenseMode,key1,key2,url){
        var commandData = {
            "cmd_type": "setLicenseKey",
            "licenseMode": licenseMode,
            "key1": key1,
            "key2": key2,
            "url": url
        };
        self.sendWebSocketCommand(commandData);
    }

    //加载所有可用的扫描设备
    self.loadDevices = function () {
        var cmdObj = {
            "cmd_type": "getDevicesList"
        }
        self.sendWebSocketCommand(cmdObj);
    };

    //设置当前选中的扫描设备id
    self.selectScanDevice = function (deviceIndex) {
        var cmdObj = {
            "cmd_type": "selectScanDevice",
            "deviceIndex": deviceIndex
        }
        self.sendWebSocketCommand(cmdObj);
    };

    //开始扫描
    self.startScan = function () {
        var cmdObj = {
            "cmd_type": "startScan",
            "config": self.scaner_work_config
        }
        self.sendWebSocketCommand(cmdObj);
    };

    //清除全部扫描结果
    self.clearAll = function () {
        var cmdObj = {
            "cmd_type": "clearAll"
        }
        self.sendWebSocketCommand(cmdObj);
    }

    //获取图像总数
    self.getImageCount = function () {
        var cmdObj = {
            "cmd_type": "getImageCount"
        }
        self.sendWebSocketCommand(cmdObj);
    }

    //获取所有图像
    self.getAllImage = function () {
        var cmdObj = {
            "cmd_type": "getAllImage"
        }
        self.sendWebSocketCommand(cmdObj);
    }

    //获取某一页图像
    self.getImageById=function(index) {
        var cmdObj = {
            "cmd_type": "getImageById",
            "index": index
        }
        self.sendWebSocketCommand(cmdObj);
    }

    //远程加载服务器端的多页图像
    self.loadImageFromUrl = function (url) {
        var cmdObj = {
            "cmd_type": "loadImageFromUrl",
            "url": url
        }
        self.sendWebSocketCommand(cmdObj);        
    }

    //旋转某一页图像
    self.rotateImage = function (index, angle) {
        var cmdObj = {
            "cmd_type": "rotateImage",
            "index": index,
            "angle": angle
        }
        self.sendWebSocketCommand(cmdObj);
    }

    //获取某一页图像的宽度
    self.getImageSize = function (index) {
        var cmdObj = {
            "cmd_type": "getImageSize",
            "index": index
        }
        self.sendWebSocketCommand(cmdObj);
    }

    //删除某一页图像
    self.deleteImageByIndex = function (index) {
        var cmdObj = {
            "cmd_type": "deleteImageByIndex",
            "index": index
        }
        self.sendWebSocketCommand(cmdObj);
    }

    //以pdf格式上传全部图像到服务器端
    self.uploadAllImageAsPdfToUrl = function (url,id,desc) {
        var cmdObj = {
            "cmd_type": "uploadAllImageAsPdfToUrl",
            "url": url,
            "id": id,
            "desc": desc
        }
        self.sendWebSocketCommand(cmdObj);
    }

    //以tiff格式上传全部图像到服务器端
    self.uploadAllImageAsTiffToUrl=function(url,id,desc) {
        var cmdObj = {
            "cmd_type": "uploadAllImageAsTiffToUrl",
            "url": url,
            "id": id,
            "desc": desc
        }
        self.sendWebSocketCommand(cmdObj);
    }

    //以jpg格式上传某一页图像到服务器端
    self.uploadJpgImageByIndex=function(url,id,desc,index) {
        var cmdObj = {
            "cmd_type": "uploadJpgImageByIndex",
            "index": index,
            "url": url,
            "id": id,
            "desc": desc
        }
        self.sendWebSocketCommand(cmdObj);
    }

    //全部图像保存到客户端本地文件
    self.saveAllImageToLocal = function (filename) {
        var cmdObj = {
            "cmd_type": "saveAllImageToLocal",
            "filename": filename
        }
        self.sendWebSocketCommand(cmdObj);
    }

    //从客户端本地读取图像,通过打开文件对话框选择图像文件
    self.openClientLocalfile=function() {
        var cmdObj = {
            "cmd_type": "openClientLocalfile"
        }
        self.sendWebSocketCommand(cmdObj);
    }

    //ftp上传全部图像文件到服务器端
    self.ftpUploadAllImage=function(serverIp,port,username,password,serverPath,filename) {
        var cmdObj = {
            "cmd_type": "ftpUploadAllImage",
            "serverIp": serverIp,
            "port": port,
            "username": username,
            "password": password,
            "serverPath": serverPath,
            "filename": filename
        }
        self.sendWebSocketCommand(cmdObj);
    }
};
