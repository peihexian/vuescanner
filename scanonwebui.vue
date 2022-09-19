<template>
  <div class="scanonweb_panel">
    <div style="height: 20px;background-color:chocolate;">
      <label style="text-align: center;display: inline-block;width: 100%; font-size: 12px;">扫描参数</label>
    </div>
    <form>
      <div class="block">
        <label for="showUI">是否显示组件界面：</label>
        <select id="showUI">
          <option value="true">显示</option>
          <option value="false" selected>不显示</option>
        </select>
      </div>
      <div class="block">
        <label for="devices">扫描设备：</label>
        <select id="devices"></select>
      </div>
      <div class="block">
        <label for="dpi_x">设备输入分辨率：</label>
        <input type="text" id="dpi_x" v-model="dpi_x" style="width: 25px;" /> X
        <input type="text" id="dpi_y" v-model="dpi_y" style="width: 25px;" />
      </div>
      <div class="block">
        <label for="showDialog">是否显示内置对话框：</label>
        <select id="showDialog">
          <option value="true">显示</option>
          <option value="false" selected>不显示</option>
        </select>
      </div>
      <div class="block">
        <label for="feedEnable">自动进纸模式：</label>
        <select id="feedEnable">
          <option value="true">是</option>
          <option value="false" selected>否</option>
        </select>
      </div>
      <div class="block">
        <label for="autoFeed">自动装填纸张：</label>
        <select id="autoFeed">
          <option value="true">是</option>
          <option value="false" selected>否</option>
        </select>
      </div>
      <div class="block">
        <label>双面模式：</label>
        <select id="dupxMode">
          <option value="true">是</option>
          <option value="false" selected>否</option>
        </select>
      </div>
      <div class="block">
        <label>自动纠偏：</label>
        <select id="autoDeskew">
          <option value="true">是</option>
          <option value="false" selected>否</option>
        </select>
      </div>
      <div class="block">
        <label>自动边框检测：</label>
        <select id="autoBorderDetection">
          <option value="true">是</option>
          <option value="false" selected>否</option>
        </select>
      </div>
    </form>
  </div>
</template>
<script>
module.exports = {
  data:function() {
    return {
    showUI: 'false',
    devices: '',
    dpi_x: 300,
    dpi_y: 300,
    }
  },
  props:{
  },
  created: function () {
    // //加载scanonweb.js
    // let script = document.createElement('script');
    // script.type = 'text/javascript';
    // script.src = 'scanonweb.js';
    // document.body.appendChild(script);

    this.scanonweb = new ScanOnWeb();
    //响应返回扫描设备列表的回调函数
    this.scanonweb.onGetDevicesListEvent = function (msg) {
      console.log(msg);
      var deviceListDom = document.getElementById('devices');

      //clear devices list
      deviceListDom.innerHTML = "";
      for (var i = 0; i < deviceListDom.childNodes.length; i++) {
        ardeviceListDomea.removeChild(deviceListDom.options[0]);
        deviceListDom.remove(0);
        deviceListDom.options[0] = null;
      }

      //add devices info
      for (var i = 0; i < msg.devices.length; ++i) {
        var opt = document.createElement("option");
        opt.innerHTML = msg.devices[i];
        if (i == msg.currentIndex) {
          opt.selected = true;
        }
        deviceListDom.appendChild(opt);
      }
    }

    // //响应扫描完成事件
    this.scanonweb.onScanFinishedEvent = function (msg) {
      document.getElementById('pdf_viewer').contentWindow.location.reload();
    }
  },
  mounted: function () {
  },
  methods: {
    //开始扫描
    startScan: function () {
      if (document.getElementById("devices").selectedIndex == -1) {
        alert('请先刷新或者选中要使用的扫描设备后再开始扫描!');
        return;
      }

      //以下获取界面中的扫描参数设定
      this.scanonweb.scaner_work_config.dpi_x = dpi_x.value;
      this.scanonweb.scaner_work_config.dpi_y = dpi_y.value;
      this.scanonweb.scaner_work_config.deviceIndex = document.getElementById("devices").selectedIndex;
      this.scanonweb.scaner_work_config.showDialog = document.getElementById("showDialog").value;
      this.scanonweb.scaner_work_config.autoFeedEnable = document.getElementById("feedEnable").value;
      this.scanonweb.scaner_work_config.autoFeed = document.getElementById("autoFeed").value;
      this.scanonweb.scaner_work_config.dupxMode = document.getElementById("dupxMode").value;
      this.scanonweb.scaner_work_config.autoDeskew = document.getElementById("autoDeskew").value;
      this.scanonweb.scaner_work_config.autoBorderDetection = document.getElementById("autoBorderDetection").value;

      //开始发送扫描指令
      this.scanonweb.startScan();
    }
  }
}
</script>
<style>
.scanonweb_panel {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>