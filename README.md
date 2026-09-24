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

## 云端保存（Supabase）

1. 在 Supabase SQL Editor 运行 supabase/setup.sql。
2. Authentication → URL Configuration：Site URL 设为 https://naomipp035.github.io/Thesis/mobile.html；Redirect URLs 添加这个地址。开发时另外添加 http://127.0.0.1:4174/mobile.html。
3. 更新 GitHub Pages 后，点“登录并保存到云端”，输入邮箱，通过邮件链接登录。同一邮箱在不同设备登录后可读取自己的记录。Supabase 控制台账号与网站的登录是两套会话。
4. 默认邮件服务可能只允许项目组织成员邮箱；个人测试使用注册 Supabase 的邮箱。对其他用户开放时，在 Authentication 中配置自己的 SMTP 服务。
5. 记录表启用 RLS，所有读写受 auth.uid() 限制。公开 key 可放前端；不要放 service_role、Secret key 或数据库密码。

shared/vendor/supabase-2.117.1.js 为固定版本的官方浏览器客户端（来源 @supabase/supabase-js，MIT）。shared/cloud-config.js 仅包含公开连接参数。

保存流程：先保留按账号隔离的本地待同步记录，再 upsert 数据库，收到匹配记录返回才标记成功；失败可点“重试待同步记录”。重新提交同一记录编号不会产生重复。星图分页加载云端数据，离线可显示本账号最近缓存。退出账号后从当前星图移除其记录。

“上传本浏览器旧记录”只在用户点击时迁移旧 localStorage 记录，保留原件；“导出备份”下载本账号云端记录和待同步记录。不会自动上传既有本地记录。初始演示节点不写入数据库。
