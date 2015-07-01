# CloudtrailLogChecker
## 概要
* CloudTrailで出力したログのチェック
* 設定したS3バケットのオブジェクト追加で実行
* s3にアップしたファイルを解凍してJSON文字列化
* JSONのメッセージ分チェックが回る

## 今チェックしていること
* 実行ユーザがrootだった場合
