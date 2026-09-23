# Between Surfaces

## 文件布局
- mobile.html：唯一手机记录入口。
- assets/mobile/：手机页样式、交互。
- tutu/map.html：现有星图入口；tutu/app.js、tutu/style.css 保留原位置。
- shared/records.js：共用浏览器存储。
- scripts/serve.mjs：本地预览服务。

运行 node scripts/serve.mjs，打开 http://127.0.0.1:4174/mobile.html 或 http://127.0.0.1:4174/tutu/map.html。

当前功能：按住说话（浏览器支持语音识别且授权时）、松开结束、编辑文字与感官字段、选择星星颜色、确认后保存在当前浏览器。标题从首句截取，其余字段由用户填写；尚未接入 AI 内容整理。没有云端跨设备同步，也不保存音频。浏览器转写服务可能需要联网，部分浏览器不支持；可用文字入口。localhost 仅供这台电脑预览，手机实际访问需要后续配置可访问的安全地址。

手机页草稿与确认记录使用 localStorage。同源星图可即时接收；清除浏览器数据会删除记录。请保留重要文字。初始星图包含虚构演示情境，新增内容保留用户输入，没有分类开关。
