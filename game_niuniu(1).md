## 游戏后台API

**接口地址：**

```php
http://120.79.21.200
```

**特别说明**

接口请求方式和流程与商城一致

**接口流程**

```php
1、获取用户游戏配置信息（长链配置信息等）以及用户资产信息
2、游戏筹码兑换（用户操作，如果已经有筹码，可以直接跳过）
3、建立长链，并且绑定长链（长链用于接受游戏消息推送）
4、用户下注
5、获取开奖信息
6、获取结算信息
```


### 1.获取用户游戏配置信息
 接口地址：/api/gameinfo_niuniu
  
 请求方式:get

 是否分页:否
 
 请求参数: 无
 
  **返回数据（data字段）**

属性 | 类型 | 说明
--- | --- | ----
coin_num | int | 长链IP地址
fufen_num | int | 长链端口
config | Array | 配置（详见下表）

  **返回数据（config字段）**

属性 | 类型 | 说明
--- | --- | ----
exchange_rate | int | 兑换比例（多少积分换一个筹码）
ip | string | IP地址
port | int | 端口
method | string | 长链链接方式（ws://|wss://）


例子数据：

```json
{
    "status": true,
    "error_msg": "ok",
    "error_code": "",
    "data": {
        "coin_num": "112",
        "fufen_num": "8700",
        "config": {
            "exchange_rate": 1,
            "ip": "120.79.21.200",
            "port": 18282,
            "method": "ws://"
        }
    },
    "list": []
}
```


### 2.游戏筹码兑换
 接口地址：/api/exchangecoin
  
 请求方式:post

 是否分页:否
 
 请求参数: 
 
 属性 | 类型 | 说明
--- | --- | ----
num | int | 兑换的数量（比如兑换的积分）
type_for | int | 兑换类型（0：积分兑换游戏币，1：游戏币兑换积分）
type | int | 游戏类型（固定为：1）

返回值：

```json
{
    "status": true,
    "error_msg": "ok",
    "error_code": "",
    "data": true,
    "list": []
}
```
