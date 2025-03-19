// 名称: 酷狗概念版自动签到
// 描述: 通过捕获请求参数实现每日自动签到
// 版本: 2.0
// 作者: yourname
// 触发方式: 参数捕获 + 定时任务

const paramKey = 'kugou_sign_params';
const logTitle = '酷狗概念版签到';

if (typeof $request !== 'undefined') {
    // 捕获请求参数
    if ($request.url.includes('/yutc/youth/v1/task/signon')) {
        const params = new URL($request.url).searchParams.toString();
        $prefs.setValueForKey(params, paramKey);
        $notify(logTitle, '参数更新成功', '已保存最新签到参数');
    }
    $done({});
} else {
    // 执行签到任务
    (async () => {
        try {
            const params = $prefs.valueForKey(paramKey);
            if (!params) {
                $notify(logTitle, '错误', '请先手动签到获取参数');
                return;
            }
            
            const response = await $task.fetch({
                url: `https://gateway.kugou.com/yutc/youth/v1/task/signon?${params}`,
                method: 'GET'
            });
            
            const result = JSON.parse(response.body);
            if (result.err_code === 0) {
                $notify(logTitle, '签到成功', `累计天数: ${result.data.sign_days}`);
            } else {
                $notify(logTitle, '失败', result.err_msg || '接口返回异常');
            }
        } catch (error) {
            $notify(logTitle, '请求异常', error.message || error);
        }
    })();
}
