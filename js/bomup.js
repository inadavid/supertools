var codes = {};
bomexcel_arr = [];
bom = [];
var parents = [];
var countNode = 1;
var bomtopArr = [];
if (Base64 == null) var Base64 = require('js-base64').Base64;
$("button[type=submit][step=1]").on("click", (e) => {
    $(e.currentTarget).prop("disabled", true);
    //only for test
    //if ($("input[meta=bomtop]").val().trim().length == 0) $("input[meta=bomtop]").val("2532000225");
    //if ($("textarea[meta=bomexcel]").val().trim().length == 0) $("textarea[meta=bomexcel]").val(Base64.decode("TGV2ZWwJTWF0ZXJpYWwjCUgJRHJhd2luZyMJTmFtZSBDTglOYW1lIEVOCURlc2MJTXR5cGUgSUQJTXR5cGUgRGVzYwlRdHkJVW5pdAlQdXJjaGFzaW5nIFR5cGUgSUQJUHVyY2hhc2luZyBUeXBlCVJlbWFyaw0KLjHigKbigKYuCTI1MjkxMDAwODMJ4oaSCVBGMzIwMC0wMy0xMS0wMAnlhaXlj6Pmgqzoh4LmgLvoo4UJCQkJCTEJZWEJQQlBc3NlbWJsZSBpbnNpZGUgU1RKCeWNh+eJiA0KLi4y4oCm4oCmCTI1MzIwMDAyNzQJ4oaSCVBGMzIwMC0wMy0wMS0wMAnlhaXlj6Pmgqzoh4Loo4XphY0JCQkJCTEJZWEJQQlBc3NlbWJsZSBpbnNpZGUgU1RKCQ0K4oCmM+KApi4uCTI1MzIwMDAxMDUJ4oaSCVBGMzIwMC0wMy0wMS0wMS0wMAnlhaXlj6Pmgqzoh4Llronoo4Xmnb/nu4TnhIoJCQkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYuNOKApi4JMjUyOTEwMDA2MAnihpIJUEYzMjAwLTAzLTAxLTAxLTAxCeWFpeWPo+aCrOiHguWuieijheadvwkJCQkJMQllYQlOCUFwcG9pbnRlZCBzdWItc3VwcGxpZXIgZm9yIHN1cHBsaWVyCQ0K4oCmLjTigKYuCTI1MjkxMDAwNjEJ4oaSCVBGMzIwMC0wMy0wMS0wMS0wMgnmgqzoh4LkuIrlronoo4XmnrYJCQkJCTEJZWEJTglBcHBvaW50ZWQgc3ViLXN1cHBsaWVyIGZvciBzdXBwbGllcgkNCuKApi404oCmLgkyNTI5MTAwMDYyCeKGkglQRjMyMDAtMDMtMDEtMDEtMDQJ5oKs6IeC56uv5a2Q5o6S5a6J6KOF5p2/CQkJCQkxCWVhCU4JQXBwb2ludGVkIHN1Yi1zdXBwbGllciBmb3Igc3VwcGxpZXIJDQrigKYuNOKApi4JMjUyOTEwMDA2MwnihpIJUEYzMjAwLTAzLTAxLTAxLTA1CeawlOeuoei9rOaOpeaUr+aetgkJCQkJMgllYQlOCUFwcG9pbnRlZCBzdWItc3VwcGxpZXIgZm9yIHN1cHBsaWVyCQ0K4oCmLjTigKYuCTI1MjkxMDAwNjQJ4oaSCVBGMzIwMC0wMy0wMS0wMS0wNgnnm7Top5LliqDlvLrnrYsJCQkJCTMJZWEJTglBcHBvaW50ZWQgc3ViLXN1cHBsaWVyIGZvciBzdXBwbGllcgkNCuKApi404oCmLgkyNTI5MTAwMDQzCeKGkglQRjMyMDAtMDEtMDItMDEtMDMJ5py6566x55S156OB6ZiA5a6J6KOF5p62CQkJCQkxCWVhCU4JQXBwb2ludGVkIHN1Yi1zdXBwbGllciBmb3Igc3VwcGxpZXIJDQrigKYz4oCmLi4JMjUzMjAwMDExNAnihpIJUEYzMjAwLTAzLTAxLTAzCeaCrOiHguaRhuWKqOi9tOaJv+W6pwkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkyNTMyMDAwMTEzCeKGkglQRjMyMDAtMDMtMDEtMDIJ5YWl5Y+j5oKs6IeC5pGG5Yqo6L20CQkJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmM+KApi4uCTI1MzIwMDAyNzYJ4oaSCVBGMzIwMC0wMy0wMS0wNS0wMAnmgqzoh4LljovlipvosIPoioLnu4Tku7YJCQkJCTEJZWEJQQlBc3NlbWJsZSBpbnNpZGUgU1RKCQ0K4oCmLjTigKYuCTI1MzIwMDAxODYJ4oaSCVBGMzIwMC0wMy0wMS0wNS0wMQnmgqzoh4LljovlipvosIPoioLlronoo4Xmnb8JCQkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYuNOKApi4JMTUwMTE1ODAwNgnihpIJRi1HVTQwMTBNIOS6muW+t+WuognljovlipvooagJCUYtR1U0MDEwTSDkuprlvrflrqIJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmLjTigKYuCTE1MDMwMDQwNzIJ4oaSCVBMRjYwMSDkuprlvrflrqIJ5YaF6J6657q55byv5aS0CQlQTEY2MDEg5Lqa5b635a6iCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi404oCmLgkxNTAzMDE2MDAzCeKGkglTUjIwMDA2TiDkuprlvrflrqIJ6LCD5Y6L6ZiACQlTUjIwMDA2TiDkuprlvrflrqIJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmLjTigKYuCTE1MDMwMDQwNTgJ4oaSCVBMNjAxIOS6muW+t+WuognlvK/lpLQJCVBMNjAxIOS6muW+t+WuogkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYuNOKApi4JMTUwMzAwMzA2MAnihpIJUEM2MDEg5Lqa5b635a6iCeebtOmAmgkJUEM2MDEg5Lqa5b635a6iCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkyNTMyMDAwMzAxCeKGkglQRjMyMDAtMDMtMDEtMDEtMDMJ5pGG6IeC5rCU57y45a6J6KOF5Z2XCQkJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmM+KApi4uCTI1MzIwMDAyNzUJ4oaSCVBGMzIwMC0wMy0wMS0wNC0wMAnmkYboh4LkuInkvY3pmIDnu4Tku7YJCQkJCTEJZWEJQQlBc3NlbWJsZSBpbnNpZGUgU1RKCQ0K4oCmLjTigKYuCTI1MjkxMDAwMzcJ4oaSCTRWMTIwLTA2QuS4u+S9kyDkuprlvrflrqIJ55S156OB6ZiACQk0VjEyMC0wNkLkuLvkvZMg5Lqa5b635a6iCQkJMQllYQlDCVN1cHBsaWVyIGNyZWF0ZSBmcm9tIGEgIlAiIG1hdGVyaWFsIGR1cmluZyBhc3NlbWJseS4JDQrigKYuLjXigKYJMjkwMjAwMTAwOAnihpIJNue6vyDljZzkuIDnp5HmioAJSW5sZXQgUGVuZHVsdW0gaGFybmVzcwkJNue6vyDljZzkuIDnp5HmioAJCQkwCWVhCVYJVmlydHVhbCBtYXRlcmlhbAkNCuKApi404oCmLgkxNTAzMDA0MDU4CeKGkglQTDYwMSDkuprlvrflrqIJ5byv5aS0CQlQTDYwMSDkuprlvrflrqIJCQkyCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmLjTigKYuCTE1MDMwMDQwNjMJ4oaSCVBMTDYwMSDkuprlvrflrqIJ5Yqg6ZW/5byv5aS0CQlQTEw2MDEg5Lqa5b635a6iCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi404oCmLgkxNTAzMDI0MDEwCeKGkglCU0xNLTAxIOS6muW+t+Wuognmtojpn7PlmagJCUJTTE0tMDEg5Lqa5b635a6iCQkJMgllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkyNTMyMDAwMjc3CeKGkglQRjMyMDAtMDMtMDEtMDYtMDAJ5YWl5Y+j57q/57yG5a6J6KOF5p2/57uE5Lu2CQkJCQkxCWVhCUEJQXNzZW1ibGUgaW5zaWRlIFNUSgkNCuKApi404oCmLgkyNTI5MTAwMDE1CeKGkglQRjMyMDAtMDMtMDEtMDYtMDIJ5YWl5Y+j5oKs6IeC57q/57yG5a6J6KOF5p2/LVBDQgkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi404oCmLgkxNTAxMTU5MDA1CeKGkglWR0EtMTVQSU4g5Y2c5LiA56eR5oqACVBDQuadvwkJVkdBLTE1UElOIOWNnOS4gOenkeaKgAkJCTIJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYuNOKApi4JMTUwMTE1NzAwMgnihpIJUExNNiDkuprlvrflrqIJ55u06KeS56m/5p2/CQlQTE02IOS6muW+t+WuogkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMTUwMTE1NzAwMgnihpIJUExNNiDkuprlvrflrqIJ55u06KeS56m/5p2/CQlQTE02IOS6muW+t+WuogkJCTIJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMTUwMzAwNDA3MAnihpIJQVBMSjYg5Lqa5b635a6iCeaPkueuoeW8r+WktAkJQVBMSjYg5Lqa5b635a6iCQkJMgllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkxNTAzMDAyMDIwCeKGkglQWTYg5Lqa5b635a6iCVnlnovkuInpgJoJCVBZNiDkuprlvrflrqIJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmM+KApi4uCTE0MDEwMTUwMjYJ4oaSCU02KjE2IEdCL1Q3MC4xLTIwMDAJ5YaF5YWt6KeS5ZyG5p+x5aS06J666ZKJCQlNNioxNiBHQi9UNzAuMS0yMDAwCQkJNAllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkxNDAyMDAyMDA0CeKGkgk2MjA1IEdCL1QgMjc2LTE5OTQgCea3seayn+eQg+i9tOaJvwkJNjIwNSBHQi9UIDI3Ni0xOTk0IAkJCTIJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMTQwMzAwMTAwOAnihpIJRDI1IEdCL1QgODk0LjEtMTk4NgnovbTnlKjlvLnmgKfmjKHlnIgJCUQyNSBHQi9UIDg5NC4xLTE5ODYJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmM+KApi4uCTE0MDEwMjcwMjIJ4oaSCU01KjEwIEdCL1Q3Ny0yMDA3CeWGheWFreinkuW5s+err+e0p+WumuieuumSiQkJTTUqMTAgR0IvVDc3LTIwMDcJCQk2CWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmM+KApi4uCTE0MDEwMDgwMzAJ4oaSCU00KjggR0IvVDcwLjItMjAwMAnlhoXlha3op5LlubPlnIblpLTonrrpkokJCU00KjggR0IvVDcwLjItMjAwMAkJCTQJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMTQwMTAxNTAxNgnihpIJTTUqMTYgR0IvVDcwLjEtMjAwMAnlhoXlha3op5LlnIbmn7HlpLTonrrpkokJCU01KjE2IEdCL1Q3MC4xLTIwMDAJCQk0CWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmM+KApi4uCTE0MDEwMTUwNzcJ4oaSCU0zKjI1IEdCL1Q3MC4xLTIwMDAJ5YaF5YWt6KeS5ZyG5p+x5aS06J666ZKJCQlNMyoyNSBHQi9UNzAuMS0yMDAwCQkJMgllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkxNDAxMDEwMDAzCeKGkglEMyBHQi9UIDk1LTIwMDIJ5bmz5Z6r5ZyICQlEMyBHQi9UIDk1LTIwMDIJCQkyCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmM+KApi4uCTE0MDEwMTAwMDQJ4oaSCUQ0IEdCL1QgOTUtMjAwMgnlubPlnqvlnIgJCUQ0IEdCL1QgOTUtMjAwMgkJCTIJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMTQwMTAxMTAwMgnihpIJRDQgR0IvVCA5My0xOTg3CeW8ueewp+Weq+WciAkJRDQgR0IvVCA5My0xOTg3CQkJMgllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkxNDAxMDE5MDA2CeKGkglNNCBHQi9UIDQxLTIwMDAgCeWFreinkuieuuavjQkJTTQgR0IvVCA0MS0yMDAwIAkJCTIJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMTQwMTAxNTA0MAnihpIJTTMqMTYgR0IvVDcwLjEtMjAwMAnlhoXlha3op5LlnIbmn7HlpLTonrrpkokJCU0zKjE2IEdCL1Q3MC4xLTIwMDAJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0KLi4y4oCm4oCmCTI1MzIwMDAyNzgJ4oaSCVBGMzIwMC0wMy0wMi0wMAnlhaXlj6PmkYboh4Lnu4Tku7YJCQkJCTEJZWEJQQlBc3NlbWJsZSBpbnNpZGUgU1RKCQ0K4oCmM+KApi4uCTI1MzIwMDAyODIJ4oaSCVBGMzIwMC0wMy0wNy0wMAnmiqTnu7Plmajnu4Tku7bkuIsJCQkJCTEJZWEJQQlBc3NlbWJsZSBpbnNpZGUgU1RKCeWNh+eJiA0K4oCmLjTigKYuCTI1MjkxMDAwMDYJ4oaSCVBGMzIwMC0wMy0wNy0wMwnmiqTnur/mn7HkuIst5rOo5aGR6L2uCQkJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmLjTigKYuCTI1MjMwMDA0MjMJ4oaSCVBGNDMwMC1VLTA3CeaKpOe6v+afseerr+eblgkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi404oCmLgkyNTMyMDAwMTMyCeKGkglQRjMyMDAtMDMtMDctMDEJUEYzMjAw5oqk57uz5ZmoCQkJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCeWNh+eJiA0K4oCmLjTigKYuCTE0MDEwMjcwMzAJ4oaSCU02KjIwIEdCL1Q3Ny0yMDA3CeWGheWFreinkuW5s+err+e0p+WumuieuumSiQkJTTYqMjAgR0IvVDc3LTIwMDcJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmLjTigKYuCTE0MDkwMzgyNjAJ4oaSCTI1LU02CeeQg+Wei+aPoeafhAkJMjUtTTYJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCeingeWbvg0K4oCmLjTigKYuCTE0MDEwMTAwMDUJ4oaSCUQ2IEdCL1QgOTUtMjAwMgnlubPlnqvlnIgJCUQ2IEdCL1QgOTUtMjAwMgkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYuNOKApi4JMTQwMTAwODAyOQnihpIJTTQqMTAgR0IvVDcwLjItMjAwMAnlhoXlha3op5LlubPlnIblpLTonrrpkokJCU00KjEwIEdCL1Q3MC4yLTIwMDAJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCeinhOagvOWPmOabtA0K4oCmLjTigKYuCTE0MDEwNDQwMDUJ4oaSCU04KjIwCeWGheWFreinkueQg+WktOafseWhngkJTTgqMjAJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCeingeWbvg0K4oCmLjTigKYuCTE0MDEwMTkwMDUJ4oaSCU04IEdCL1QgNDEtMjAwMCAJ5YWt6KeS6J665q+NCQlNOCBHQi9UIDQxLTIwMDAgCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi404oCmLgkxNDAxMDE1MDI3CeKGkglNNioyMCBHQi9UNzAuMS0yMDAwCeWGheWFreinkuWchuafseWktOieuumSiQkJTTYqMjAgR0IvVDcwLjEtMjAwMAkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMjUzMjAwMDEyMwnihpIJUEYzMjAwLTAzLTAyLTAxCeaCrOiHguaRhuiHggkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkyNTI5MTAwMDA1CeKGkglQRjMyMDAtMDMtMDItMDYJ5oKs6IeC5pGG6IeC6L2u6L20LeazqOWhkei9rgkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkyNTMyMDAwMTg3CeKGkglQRjMyMDAtMDMtMDItMDMJ5pGG6IeC5aS55p2/QgkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkyNTMyMDAwMTI0CeKGkglQRjMyMDAtMDMtMDItMDIJ5pGG6IeC5aS55p2/QQkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkyNTIzMDAwNDg0CeKGkglQRjQzMDAtUC0wNAnlrprkvY3lpZcJCQkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMjUyOTAwMDAzMQnihpIJMjgwLTM1CTM16L2u57uE5Lu2LeazqOWhkQkJMjgwLTM1CQkJMgllYQlCCUJ1eSBmcm9tIHZlbmRvcgnop4Hlm74NCuKApi404oCmLgkyNTI5MTAwMDc5CeKGkgkyODAtMzUgQm9keQkzNei9rui9ruS9kwkJMjgwLTM1IEJvZHkJCQkyCWVhCU4JQXBwb2ludGVkIHN1Yi1zdXBwbGllciBmb3Igc3VwcGxpZXIJ5bC86b6ZK+eOu+e6pA0K4oCmLjTigKYuCTI1MjkxMDAwODAJ4oaSCTI4MC0zNSBFbmQgQ292ZXIJMzXova7nq6/nm5YJCTI4MC0zNSBFbmQgQ292ZXIJCQkyCWVhCU4JQXBwb2ludGVkIHN1Yi1zdXBwbGllciBmb3Igc3VwcGxpZXIJ5bC86b6ZK+eOu+e6pA0K4oCmLjTigKYuCTE0MDIwMDIwMDMJ4oaSCTYyMDIgR0IvVCAyNzYtMTk5NAnmt7Hmsp/nkIPovbTmib8JCTYyMDIgR0IvVCAyNzYtMTk5NAkJCTQJZWEJTglBcHBvaW50ZWQgc3ViLXN1cHBsaWVyIGZvciBzdXBwbGllcglOU0sNCuKApjPigKYuLgkxNDAxMDE0MDA1CeKGkglNNio2IEdCL1Q3Ny0yMDA3CeWGheWFreinkuW5s+err+e0p+WumuieuumSiQkJTTYqNiBHQi9UNzctMjAwNwkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMjUyOTEwMDAwOQnihpIJUEYzMjAwLTAzLTA4LTA0CTM15rOo5aGR6L2u6aG25ZyICQkJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmM+KApi4uCTI1MjkxMDAwMTAJ4oaSCVBGMzIwMC0wMy0wOC0wNQkzNeazqOWhkei9ruWklumhtuWciAkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkxNDAxMDE1MDA4CeKGkglNNCoxNiBHQi9UNzAuMS0yMDAwCeWGheWFreinkuWchuafseWktOieuumSiQkJTTQqMTYgR0IvVDcwLjEtMjAwMAkJCTQJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMTQwMTAwOTAzNQnihpIJTTUqMjAgR0IvVDcwLjMtMjAwMAnlhoXlha3op5LmsonlpLTonrrpkokJCU01KjIwIEdCL1Q3MC4zLTIwMDAJCQk0CWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0KLi4y4oCm4oCmCTI1MzIwMDAxMjcJ4oaSCVBGMzIwMC0wMy0wMwnmkYboh4Llm7rlrprnq6/nm5YJCQkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQouLjLigKbigKYJMjUzMjAwMDI3OQnihpIJUEYzMjAwLTAzLTA0LTAwCeaRhuiHguawlOe8uOe7hOS7tgkJCQkJMQllYQlBCUFzc2VtYmxlIGluc2lkZSBTVEoJDQrigKYz4oCmLi4JMTUwMzAxMDIxNgnihpIJTUZDMzIqMjAwU0NBIOS6muW+t+WuognmsJTnvLgJCU1GQzMyKjIwMFNDQSDkuprlvrflrqIJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmM+KApi4uCTE1MDMwMTAyMTUJ4oaSCUYtTUYyNUkg5Lqa5b635a6iCeawlOe8uOi/nuaOpeaOpeWktAkJRi1NRjI1SSDkuprlvrflrqIJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmM+KApi4uCTE1MDMwMTMwMDgJ4oaSCUFTVjMxMEYtMDEtMDZTIFNNQwnlv6vpgJ/mjpLmsJTpmIAJCUFTVjMxMEYtMDEtMDZTIFNNQwkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMTUwMzAwNTAzNgnihpIJUFNMNjAxQSDkuprlvrflrqIJ6LCD6YCf6ZiACQlQU0w2MDFBIOS6muW+t+WuogkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQouLjLigKbigKYJMjUzMjAwMDEyNQnihpIJUEYzMjAwLTAzLTAyLTA0CeawlOe8uOerr+WktOmUgOi9tAkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCi4uMuKApuKApgkyNTMyMDAwMjgzCeKGkglQRjMyMDAtMDMtMDgtMDAJ5LiK5YKo57q/6L2u57uE5Lu2CQkJCQkxCWVhCUEJQXNzZW1ibGUgaW5zaWRlIFNUSgnml6fku7bnlKjlrozkuLrmraINCuKApjPigKYuLgkyNTMyMDAwMjg0CeKGkglQRjMyMDAtMDMtMDgtMDItMDAJUEYzMjAw5oqk57uz5Zmo57uE5Lu25LiKCQkJCQkxCWVhCUEJQXNzZW1ibGUgaW5zaWRlIFNUSgnml6fku7bnlKjlrozkuLrmraINCuKApi404oCmLgkyNTI5MTAwMDA4CeKGkglQRjMyMDAtMDMtMDgtMDItMDIJ5oqk57q/5p+x5LiKLeazqOWhkei9rgkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgnml6fku7bnlKjlrozkuLrmraINCuKApi404oCmLgkyNTIzMDAwNDIzCeKGkglQRjQzMDAtVS0wNwnmiqTnur/mn7Hnq6/nm5YJCQkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJ5pen5Lu255So5a6M5Li65q2iDQrigKYuNOKApi4JMjUzMjAwMDEzMgnihpIJUEYzMjAwLTAzLTA3LTAxCVBGMzIwMOaKpOe7s+WZqAkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgnml6fku7bnlKjlrozkuLrmraINCuKApi404oCmLgkxNDAxMDI3MDMwCeKGkglNNioyMCBHQi9UNzctMjAwNwnlhoXlha3op5LlubPnq6/ntKflrpronrrpkokJCU02KjIwIEdCL1Q3Ny0yMDA3CQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgnml6fku7bnlKjlrozkuLrmraINCuKApi404oCmLgkxNDA5MDM4MjYwCeKGkgkyNS1NNiDop4Hlm74J55CD5Z6L5o+h5p+ECQkyNS1NNiDop4Hlm74JCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCeaXp+S7tueUqOWujOS4uuatog0K4oCmLjTigKYuCTE0MDEwMTAwMDUJ4oaSCUQ2IEdCL1QgOTUtMjAwMgnlubPlnqvlnIgJCUQ2IEdCL1QgOTUtMjAwMgkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJ5pen5Lu255So5a6M5Li65q2iDQrigKYuNOKApi4JMTQwMTAwODAwMgnihpIJTTQqMTYgR0IvVDcwLjItMjAwMAnlhoXlha3op5LlubPlnIblpLTonrrpkokJCU00KjE2IEdCL1Q3MC4yLTIwMDAJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCeaXp+S7tueUqOWujOS4uuatog0K4oCmLjTigKYuCTE0MDEwNDQwMDUJ4oaSCU04KjIwIOingeWbvgnlhoXlha3op5LnkIPlpLTmn7HloZ4JCU04KjIwIOingeWbvgkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJ5pen5Lu255So5a6M5Li65q2iDQrigKYuNOKApi4JMTQwMTAxOTAwNQnihpIJTTggR0IvVCA0MS0yMDAwIAnlha3op5Lonrrmr40JCU04IEdCL1QgNDEtMjAwMCAJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCeaXp+S7tueUqOWujOS4uuatog0K4oCmLjTigKYuCTE0MDEwMTUwMjcJ4oaSCU02KjIwIEdCL1Q3MC4xLTIwMDAJ5YaF5YWt6KeS5ZyG5p+x5aS06J666ZKJCQlNNioyMCBHQi9UNzAuMS0yMDAwCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgnml6fku7bnlKjlrozkuLrmraINCuKApjPigKYuLgkyNTI5MTAwMDA3CeKGkglQRjMyMDAtMDMtMDgtMDMJ5LiK5YKo57q/6L2u5a6J6KOF6L20LeazqOWhkei9rgkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgnml6fku7bnlKjlrozkuLrmraINCuKApjPigKYuLgkyNTIzMDAwNDg0CeKGkglQRjQzMDAtUC0wNAnlrprkvY3lpZcJCQkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJ5pen5Lu255So5a6M5Li65q2iDQrigKYz4oCmLi4JMTQwMTAxNDAwNQnihpIJTTYqNiBHQi9UNzctMjAwNwnlhoXlha3op5LlubPnq6/ntKflrpronrrpkokJCU02KjYgR0IvVDc3LTIwMDcJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCeaXp+S7tueUqOWujOS4uuatog0K4oCmM+KApi4uCTI1MjkwMDAwMzEJ4oaSCTI4MC0zNSDop4Hlm74JMzXova7nu4Tku7Yt5rOo5aGRCQkyODAtMzUg6KeB5Zu+CQkJMwllYQlCCUJ1eSBmcm9tIHZlbmRvcgnml6fku7bnlKjlrozkuLrmraINCuKApi404oCmLgkyNTI5MTAwMDc5CeKGkgkyODAtMzUgQm9keSDlsLzpvpkr546757qkCTM16L2u6L2u5L2TCQkyODAtMzUgQm9keSDlsLzpvpkr546757qkCQkJMwllYQlOCUFwcG9pbnRlZCBzdWItc3VwcGxpZXIgZm9yIHN1cHBsaWVyCeaXp+S7tueUqOWujOS4uuatog0K4oCmLjTigKYuCTI1MjkxMDAwODAJ4oaSCTI4MC0zNSBFbmQgQ292ZXIg5bC86b6ZK+eOu+e6pAkzNei9ruerr+eblgkJMjgwLTM1IEVuZCBDb3ZlciDlsLzpvpkr546757qkCQkJMwllYQlOCUFwcG9pbnRlZCBzdWItc3VwcGxpZXIgZm9yIHN1cHBsaWVyCeaXp+S7tueUqOWujOS4uuatog0K4oCmLjTigKYuCTE0MDIwMDIwMDMJ4oaSCTYyMDIgNjIwMiBHQi9UIDI3Ni0xOTk0IE5TSwnmt7Hmsp/nkIPovbTmib8JCTYyMDIgNjIwMiBHQi9UIDI3Ni0xOTk0IE5TSwkJCTYJZWEJTglBcHBvaW50ZWQgc3ViLXN1cHBsaWVyIGZvciBzdXBwbGllcgnml6fku7bnlKjlrozkuLrmraINCuKApjPigKYuLgkyNTI5MTAwMDA5CeKGkglQRjMyMDAtMDMtMDgtMDQJMzXms6jloZHova7pobblnIgJCQkJCTIJZWEJQglCdXkgZnJvbSB2ZW5kb3IJ5pen5Lu255So5a6M5Li65q2iDQrigKYz4oCmLi4JMjUyOTEwMDAxMAnihpIJUEYzMjAwLTAzLTA4LTA1CTM15rOo5aGR6L2u5aSW6aG25ZyICQkJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCeaXp+S7tueUqOWujOS4uuatog0KLi4y4oCm4oCmCTI1MzIwMDAyODUJ4oaSCVBGMzIwMC0wMy0xMC0wMAnlhaXlj6Plr7zlkJHnu4Tku7YJCQkJCTEJZWEJQQlBc3NlbWJsZSBpbnNpZGUgU1RKCQ0K4oCmM+KApi4uCTI1MzIwMDAxOTAJ4oaSCVBGMzIwMC0wMy0xMC0wMS0wMAnlhaXlj6Plr7zlkJHln7rluqfnu4TnhIoJCQkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYuNOKApi4JMjUyOTEwMDA2NQnihpIJUEYzMjAwLTAzLTEwLTAxLTAxCeWFpeWPo+aCrOiHguWvvOWQkeWuieijheaetgkJCQkJMQllYQlOCUFwcG9pbnRlZCBzdWItc3VwcGxpZXIgZm9yIHN1cHBsaWVyCQ0K4oCmLjTigKYuCTI1MjkxMDAwNjYJ4oaSCVBGMzIwMC0wMy0xMC0wMS0wMgnlj43lkJHnhIrmjqXmnaEJCQkJCTEJZWEJTglBcHBvaW50ZWQgc3ViLXN1cHBsaWVyIGZvciBzdXBwbGllcgkNCuKApi404oCmLgkyNTI5MTAwMDY3CeKGkglQRjMyMDAtMDMtMTAtMDEtMDMJ5a6a5L2N5a6J6KOF5bqV5p2/CQkJCQkxCWVhCU4JQXBwb2ludGVkIHN1Yi1zdXBwbGllciBmb3Igc3VwcGxpZXIJDQrigKYz4oCmLi4JMjUzMjAwMDI4NgnihpIJUEYzMjAwLTAzLTEwLTAyLTAwCeS6leWtl+WvvOWQkei9rue7hOS7tgkJCQkJMQllYQlBCUFzc2VtYmxlIGluc2lkZSBTVEoJDQrigKYuNOKApi4JMjUzMjAwMDE5MQnihpIJUEYzMjAwLTAzLTEwLTAyLTAxCeWFpeWPo+WvvOWQkea7keWKqOW6leW6pwkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi404oCmLgkyNTMyMDAwMTE4CeKGkglQRjMyMDAtMDMtMTAtMDItMDIJ5YWl5Y+j5a+85ZCR5a6J6KOF5bqnCQkJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmLjTigKYuCTI1MzIwMDAxMTkJ4oaSCVBGMzIwMC0wMy0xMC0wMi0wMwnlhaXlj6Plr7zlkJHmjKHovooJCQkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYuNOKApi4JMjUzMjAwMDI4NwnihpIJUEYzMjAwLTAzLTEwLTAyLTA0LTAwCeWFpeWPo+WvvOWQkeaKpOe6v+iHgue7hOS7tgkJCQkJMQllYQlBCUFzc2VtYmxlIGluc2lkZSBTVEoJ5Y2H54mIDQrigKYuLjXigKYJMjUzMjAwMDEyMAnihpIJUEYzMjAwLTAzLTEwLTAyLTA0LTAxCeWFpeWPo+WvvOWQkeaKpOe6v+iHggkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi4uNeKApgkyNTMyMDAwMTIxCeKGkglQRjMyMDAtMDMtMTAtMDItMDQtMDIJ5YWl5Y+j5a+85ZCR5oqk57q/5p+xCQkJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmLi414oCmCTI1MjMwMDA0MjMJ4oaSCVBGNDMwMC1VLTA3CeaKpOe6v+afseerr+eblgkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi4uNeKApgkxNDAxMDQ0MDA1CeKGkglNOCoyMAnlhoXlha3op5LnkIPlpLTmn7HloZ4JCU04KjIwCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgnop4Hlm74NCuKApi4uNeKApgkxNDA5MDM4MjYwCeKGkgkyNS1NNgnnkIPlnovmj6Hmn4QJCTI1LU02CQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgnop4Hlm74NCuKApi4uNeKApgkxNDAxMDI3MDMwCeKGkglNNioyMCBHQi9UNzctMjAwNwnlhoXlha3op5LlubPnq6/ntKflrpronrrpkokJCU02KjIwIEdCL1Q3Ny0yMDA3CQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi4uNeKApgkxNDAxMDA4MDI5CeKGkglNNCoxMCBHQi9UNzAuMi0yMDAwCeWGheWFreinkuW5s+WchuWktOieuumSiQkJTTQqMTAgR0IvVDcwLjItMjAwMAkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJ6KeE5qC85Y+Y5pu0DQrigKYuLjXigKYJMTQwMTAxOTAwNQnihpIJTTggR0IvVCA0MS0yMDAwIAnlha3op5Lonrrmr40JCU04IEdCL1QgNDEtMjAwMCAJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmLi414oCmCTE0MDEwMTAwMDUJ4oaSCUQ2IEdCL1QgOTUtMjAwMgnlubPlnqvlnIgJCUQ2IEdCL1QgOTUtMjAwMgkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYuNOKApi4JMjUzMjAwMDA5NQnihpIJUEYzMjAwLTAxLTEzLTAyCeehrOe6v+eUqOS4i+a7mui9rgkJCQkJMgllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi404oCmLgkxNDAyMDAxMzU0CeKGkgkxMC0xNC0xNgnovbTmib/pobblnIgJCTEwLTE0LTE2CQkJNgllYQlCCUJ1eSBmcm9tIHZlbmRvcgnop4Hlm74NCuKApi404oCmLgkxNDAxMDE1MDUyCeKGkglNNCoyNSBHQi9UNzAuMS0yMDAwCeWGheWFreinkuWchuafseWktOieuumSiQkJTTQqMjUgR0IvVDcwLjEtMjAwMAkJCTQJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYuNOKApi4JMTQwMTAxNTAxNAnihpIJTTUqMTIgR0IvVDcwLjEtMjAwMAnlhoXlha3op5LlnIbmn7HlpLTonrrpkokJCU01KjEyIEdCL1Q3MC4xLTIwMDAJCQkyCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmLjTigKYuCTE0MDEwMjcwMjAJ4oaSCU00KjYgR0IvVDc3LTIwMDcJ5YaF5YWt6KeS5bmz56uv57Sn5a6a6J666ZKJCQlNNCo2IEdCL1Q3Ny0yMDA3CQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi404oCmLgkxNDAxMDczMDgyCeKGkgkxMCoxMDAgR0IvVCAxMTctMjAwMAnlnIbmn7HplIAJCTEwKjEwMCBHQi9UIDExNy0yMDAwCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi404oCmLgkxNDAxMDEwMDA2CeKGkglEOCBHQi9UIDk1LTIwMDIJ5bmz5Z6r5ZyICQlEOCBHQi9UIDk1LTIwMDIJCQkyCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmLjTigKYuCTE0MDEwMTAwMDEJ4oaSCUQxMCBHQi9UIDk1LTIwMDIJ5bmz5Z6r5ZyICQlEMTAgR0IvVCA5NS0yMDAyCQkJMgllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi404oCmLgkxNDAyMDAxMzM0CeKGkglGNjAwMCBHQi9UIDcyMTgtMTk5NQnlh7jlj7DovbTmib8JCUY2MDAwIEdCL1QgNzIxOC0xOTk1CQkJMgllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi404oCmLgkxNDAyMDAyMDIxCeKGkgk2MTkwMCBHQi9UIDI3Ni0xOTk0IAnmt7Hmsp/nkIPovbTmib8JCTYxOTAwIEdCL1QgMjc2LTE5OTQgCQkJNAllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApi404oCmLgkxNDAxMDE1MDc5CeKGkgkxMCo2MCBHQi9UNTI4MS0xOTg1CeWGheWFreinkuWchuafseWktOi9tOiCqeieuumSiQkJMTAqNjAgR0IvVDUyODEtMTk4NQkJCTIJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMjUzMjAwMDE5MgnihpIJUEYzMjAwLTAzLTEwLTAzCemZkOS9jea0u+WKqOWdlwkJCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkyNTMyMDAwMTkzCeKGkglQRjMyMDAtMDMtMTAtMDQJ5rS75Yqo5ZCO5Zu65a6a5p2/CQkJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0K4oCmM+KApi4uCTI1MzIwMDAxOTQJ4oaSCVBGMzIwMC0wMy0xMC0wNQnlhaXlj6Plr7zlkJHlsIHpl63nm5bmnb8JCQkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMTQwMTAxNTA4NwnihpIJOCoxNiBHQi9UNTI4MS0xOTg1CeWGheWFreinkuWchuafseWktOi9tOiCqeieuumSiQkJOCoxNiBHQi9UNTI4MS0xOTg1CQkJMgllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCuKApjPigKYuLgkxNDAxMDE1MDE3CeKGkglNNSoyMCBHQi9UNzAuMS0yMDAwCeWGheWFreinkuWchuafseWktOieuumSiQkJTTUqMjAgR0IvVDcwLjEtMjAwMAkJCTIJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMTQwMTAwODAyOQnihpIJTTQqMTAgR0IvVDcwLjItMjAwMAnlhoXlha3op5LlubPlnIblpLTonrrpkokJCU00KjEwIEdCL1Q3MC4yLTIwMDAJCQk0CWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0KLi4y4oCm4oCmCTI1MzIwMDAxMzkJ4oaSCVBGMzIwMC0wMy0wOQnlhaXlj6Pmgqzoh4LlkI7nm5bmnb8JCQkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQouLjLigKbigKYJMTQwMTAxNTAyNwnihpIJTTYqMjAgR0IvVDcwLjEtMjAwMAnlhoXlha3op5LlnIbmn7HlpLTonrrpkokJCU02KjIwIEdCL1Q3MC4xLTIwMDAJCQkzCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0KLi4y4oCm4oCmCTE0MDEwMTUwMjgJ4oaSCU02KjMwIEdCL1Q3MC4xLTIwMDAJ5YaF5YWt6KeS5ZyG5p+x5aS06J666ZKJCQlNNiozMCBHQi9UNzAuMS0yMDAwCQkJNAllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCi4uMuKApuKApgkxNDAxMDE1MDE0CeKGkglNNSoxMiBHQi9UNzAuMS0yMDAwCeWGheWFreinkuWchuafseWktOieuumSiQkJTTUqMTIgR0IvVDcwLjEtMjAwMAkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQouLjLigKbigKYJMTQwMTAyNDAyNAnihpIJRDXvvIg1KjE077yJR0IvVDk2LjItMjAwMAnlpKflubPlnqvlnIgJCUQ177yINSoxNO+8iUdCL1Q5Ni4yLTIwMDAJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0KLi4y4oCm4oCmCTE0MDEwMTAwMDgJ4oaSCUQ1IEdCL1QgOTUtMjAwMgnlubPlnqvlnIgJCUQ1IEdCL1QgOTUtMjAwMgkJCTUJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQouLjLigKbigKYJMTQwMzAwMTAzMgnihpIJRDkgR0IvVCA4OTQuMS0xOTg2Cei9tOeUqOW8ueaAp+aMoeWciCBB5Z6LCQlEOSBHQi9UIDg5NC4xLTE5ODYJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0KLi4y4oCm4oCmCTE1MDMwMDkwMjUJ4oaSCc6mNiDpu5HoibIg5Lqa5b635a6iCeawlOeuoQkJzqY2IOm7keiJsiDkuprlvrflrqIJCQkzCW0JQglCdXkgZnJvbSB2ZW5kb3IJDQouLjLigKbigKYJMTUwMTAyNzAwNQnihpIJMyoxNTAJ5bC86b6Z5omO5bimCQkzKjE1MAkJCTAuMDEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJ5Y2V5L2NIOWMhSAx5YyFMTAwMOS4qiDljp/mlbDph482DQouLjLigKbigKYJMTcwMjAwMTM5MwnihpIJMTIwKjE3MAnoh6rlsIHloZHmlpnooosJCTEyMCoxNzAJCQkwLjAxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0KLi4y4oCm4oCmCTE0MDEwMTUwMTcJ4oaSCU01KjIwIEdCL1Q3MC4xLTIwMDAJ5YaF5YWt6KeS5ZyG5p+x5aS06J666ZKJCQlNNSoyMCBHQi9UNzAuMS0yMDAwCQkJMwllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCi4uMuKApuKApgkxNDAxMDExMDAzCeKGkglENSBHQi9UIDkzLTE5ODcJ5by557Cn5Z6r5ZyICQlENSBHQi9UIDkzLTE5ODcJCQk0CWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0KLi4y4oCm4oCmCTE0MDEwMTUwMTYJ4oaSCU01KjE2IEdCL1Q3MC4xLTIwMDAJ5YaF5YWt6KeS5ZyG5p+x5aS06J666ZKJCQlNNSoxNiBHQi9UNzAuMS0yMDAwCQkJNAllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCi4uMuKApuKApgkyOTAyMDAxMDA4CeKGkgk257q/IOWNnOS4gOenkeaKgAlJbmxldCBQZW5kdWx1bSBoYXJuZXNzCQk257q/IOWNnOS4gOenkeaKgAkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQrigKYz4oCmLi4JMTgwMzAyMjAyMAnihpIJNFYxMjAtMDZCIOS6muW+t+WuognnlLXno4HpmIAJCTRWMTIwLTA2QiDkuprlvrflrqIJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0KLi4y4oCm4oCmCTI5MDIwMDEwMTcJ4oaSCTIwMG1t5Y+M5ZyIIOWNnOS4gOenkeaKgAlHcm91bmQgd2lyZSgyKQkJMjAwbW3lj4zlnIgg5Y2c5LiA56eR5oqACQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCi4uMuKApuKApgkxNDAxMDQ1MDAzCeKGkgnDmDYgR0IvVCA4NjIuMi04NwnplK/pvb/lnqsJCcOYNiBHQi9UIDg2Mi4yLTg3CQkJMgllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCi4uMuKApuKApgkxNDAxMDE5MDAzCeKGkglNNiBHQi9UIDQxLTIwMDAgCeWFreinkuieuuavjQkJTTYgR0IvVCA0MS0yMDAwIAkJCTIJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQouLjLigKbigKYJMjkwMjAwMTAxOAnihpIJMjAwbW3ljZXlnIjljZXnsKcg5Y2c5LiA56eR5oqACUdyb3VuZCB3aXJlKDMpCQkyMDBtbeWNleWciOWNleewpyDljZzkuIDnp5HmioAJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0KLi4y4oCm4oCmCTE5MDIwMDAwMDkJ4oaSCTExKjExIEdyb3VuZAnmoIfnrb4JCTExKjExIEdyb3VuZAkJCTMJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQouLjLigKbigKYJMTkwMjAwMDAxMQnihpIJNTAqMyBXYXJuaW5nIEhhbmQgY2xhbXAJ5qCH562+CQk1MCozIFdhcm5pbmcgSGFuZCBjbGFtcAkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQouLjLigKbigKYJMTQwMTAwODAyOQnihpIJTTQqMTAgR0IvVDcwLjItMjAwMAnlhoXlha3op5LlubPlnIblpLTonrrpkokJCU00KjEwIEdCL1Q3MC4yLTIwMDAJCQk2CWVhCUIJQnV5IGZyb20gdmVuZG9yCQ0KLi4y4oCm4oCmCTI1MjkxMDAwMzEJ4oaSCTNNIOmAj+aYjiDml6DlupXoibIg55m96Imy5a2X5L2TCeagh+etvi1DT04xCQkzTSDpgI/mmI4g5peg5bqV6ImyIOeZveiJsuWtl+S9kwkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJDQouLjLigKbigKYJMjUyOTEwMDAzMgnihpIJM00g6YCP5piOIOaXoOW6leiJsiDnmb3oibLlrZfkvZMJ5qCH562+LUNPTjMJCTNNIOmAj+aYjiDml6DlupXoibIg55m96Imy5a2X5L2TCQkJMQllYQlCCUJ1eSBmcm9tIHZlbmRvcgkNCi4uMuKApuKApgkyNTI5MTAwMDc0CeKGkglJbmxldCBQZW5kdWx1bQnpk63niYwJTmFtZSBQbGF0ZQlJbmxldCBQZW5kdWx1bQkJCTEJZWEJTQltYXRlcmlhbCBpcyBtYWRlIGluIFNUSiwgbGlrZSBwcmludGVkIGxhYmVsCeingeWbvg0K4oCmM+KApi4uCTE3MDIwMDE1NTcJ4oaSCTQwKjYwCeWTkemTtue6uAkJNDAqNjAJCQkxCWVhCUIJQnV5IGZyb20gdmVuZG9yCeingeWbvg0KLjHigKbigKYuCTE0MDEwMTUwMjcJ4oaSCU02KjIwIEdCL1Q3MC4xLTIwMDAJ5YaF5YWt6KeS5ZyG5p+x5aS06J666ZKJCQlNNioyMCBHQi9UNzAuMS0yMDAwCQkJMwllYQlCCUJ1eSBmcm9tIHZlbmRvcgnnm7TmjqXljIXoo4Xlj5HotKcNCi4x4oCm4oCmLgkxNDAxMDEwMDA1CeKGkglENiBHQi9UIDk1LTIwMDIJ5bmz5Z6r5ZyICQlENiBHQi9UIDk1LTIwMDIJCQkzCWVhCUIJQnV5IGZyb20gdmVuZG9yCeebtOaOpeWMheijheWPkei0pw0KLjHigKbigKYuCTE0MDEwMTEwMDUJ4oaSCUQ2IEdCL1QgOTMtMTk4NwnlvLnnsKflnqvlnIgJCUQ2IEdCL1QgOTMtMTk4NwkJCTMJZWEJQglCdXkgZnJvbSB2ZW5kb3IJ55u05o6l5YyF6KOF5Y+R6LSnDQouMeKApuKApi4JMjkwMjAwMTAwNgnihpIJMTXpgJo3MDBtbSDljZzkuIDnp5HmioAJVkdB57q/57yGCQkxNemAmjcwMG1tIOWNnOS4gOenkeaKgAkJCTEJZWEJQglCdXkgZnJvbSB2ZW5kb3IJ55u05o6l5YyF6KOF5Y+R6LSn"));
    bom_top = $("input[meta=bomtop]").val();
    var bomexcel = $("textarea[meta=bomexcel]").val();
    if (bomexcel.length < 100) {
        alert("粘贴的数据过少，请检查后再试。");
        return;
    }
    bomexcel_arr = SheetClip.parse(bomexcel);
    var header = bomexcel_arr[0];
    var options = "";
    for (var i in header) {
        options += "<option value='" + i + "'>" + header[i] + "</option>";
    }
    options = "<option value='-1'> 无 </option>" + options;
    if (argv[2] == "dev") console.log(options)
    $("select[meta='bomexcel.level']").append(options);
    $("select[meta='bomexcel.code']").append(options);
    $("select[meta='bomexcel.quantity']").append(options);
    $("select[meta='bomexcel.procumenttype']").append(options);
    $("select[meta='bomexcel.pfep']").append(options);

    selectKey($("select[meta='bomexcel.level']"), "level");
    selectKey($("select[meta='bomexcel.code']"), "material");
    selectKey($("select[meta='bomexcel.quantity']"), "qty");
    selectKey($("select[meta='bomexcel.procumenttype']"), "Purchasing Type ID");
    selectKey($("select[meta='bomexcel.pfep']"), "pfep");

    $('div[meta="bomup"][step="2"]').css("display", "block");
});


$("button[type=submit][step=2]").on("click", (e) => {
    $(e.currentTarget).prop("disabled", true);
    if (config.fSQLserver != 4) {
        popup("数据读取出错！", "danger");
        return;
    }

    $('div[meta="bomup"][step="3"]').css("display", "block");

    var pos = {};
    var count_code = 0;
    var length_code = 0;
    pos.code = parseInt($("select[meta='bomexcel.code']").val());
    codes[bom_top] = 0;
    for (var i = 1; i < bomexcel_arr.length; i++) {
        if (codes[bomexcel_arr[i][pos.code]] == undefined) {
            codes[bomexcel_arr[i][pos.code]] = 0;
            length_code++;
        }
    }
    getCodesInfo(codes, (rtn) => {
        //console.log(rtn)
        if (!rtn.err) {
            codes = rtn.codes;
            parents = [];
            new sql.Request().query("select goodsid from st_goodsbom group by goodsid;", (err, result) => {
                for (var i in result.recordset) {
                    parents.push(result.recordset[i].goodsid);
                }
                bomtopArr = [bom_top];
                bom = formatBOM(bom_top);
                if (argv[2] == "dev") { //export a temp file for check
                    var savebom = JSON.parse(JSON.stringify(bom));
                    for (var i in savebom) {
                        savebom[i].Name = codesInfo[savebom[i].code].name;
                        savebom[i].Spec = codesInfo[savebom[i].code].spec
                    }
                    savedata(appPath + '/db/' + bom_top + '.csv', savebom);
                    //return;
                }
                var id = generateSQL(bom);
                if (!id) popup("本地数据保存失败", "danger");
                else savegoback(id);
            });
        } else if (rtn.err == 1) {
            var text = "<h5 color='red'><strong>发生错误：以下物料号在系统中不存在！请检查 </strong></h5> <textarea class='alert alert-danger' role='alert' style='width:100%;height:100px'>";
            for (var i in rtn.data) text += rtn.data[i] + "\n";
            text += "</textarea>";
            addResultText(text);
            $("textarea.alert").on("focus", (e) => {
                $(e.currentTarget).select();
            })
        }
    });

});

function addResultText(text) {
    var p = $('div[bid="bomdatainfo"]');
    p.append(text);
}

function formatBOM(bom_top) {
    var setup = {};
    setup.level = parseInt($("select[meta='bomexcel.level']").val());
    setup.code = parseInt($("select[meta='bomexcel.code']").val());
    setup.qty = parseFloat($("select[meta='bomexcel.quantity']").val());
    setup.pt = parseInt($("select[meta='bomexcel.procumenttype']").val());
    setup.pfep = parseInt($("select[meta='bomexcel.pfep']").val());

    addResultText("<div class='alert alert-primary' role='alert'>取得相关列信息</div>");

    for (var i = 1; i < bomexcel_arr.length; i++) {
        bomexcel_arr[i][setup.level] = bomexcel_arr[i][setup.level].trim().split('…').join("");
        bomexcel_arr[i][setup.level] = parseInt(bomexcel_arr[i][setup.level].trim().split('.').join(""));
    }
    bomexcel_arr.splice(0, 1);
    if (argv[2] == "dev") console.log("this bom has " + bomexcel_arr.length + " lines.")
    countNode = 1;
    var bom = gFormatBOM(bom_top, setup).data;
    //var bom = _.sortBy(gFormatBOM(bom_top, setup, level), "item");
    if (argv[2] == "dev") console.log("bom after generation: ", bom)
    addResultText("<div class='alert alert-primary' role='alert'>整理BOM上级件</div>");
    return bom;
}


function gFormatBOM(bom_top, setup, index = 0) {
    var i = index
    var rtnArr = [];
    var rtnCount = 0;
    var levelnode = 1;
    var level = bomexcel_arr[i][setup.level];
    while (true) {
        if (i >= bomexcel_arr.length) break;
        if (bomexcel_arr[i][setup.level] == level) {
            rtnArr.push({
                "code": bomexcel_arr[i][setup.code],
                "parent": bom_top,
                "qty": bomexcel_arr[i][setup.qty],
                "item": levelnode++,
                "procumenttype": setup.pt == -1 ? "" : bomexcel_arr[i][setup.pt],
                "pfep": setup.pfep == -1 ? "" : bomexcel_arr[i][setup.pfep],
                "level": level
            });
            countNode++;
            rtnCount++;
        } else if (bomexcel_arr[i][setup.level] > level) {
            var curParent = bomexcel_arr[i - 1][setup.code];
            bomtopArr.push(curParent);
            var subArr = gFormatBOM(curParent, setup, i);
            i += subArr.count;
            rtnCount += subArr.count;
            if (curParent == "2532000283") console.log("2532000283 => ", subArr);
            if (parents.indexOf(curParent) == -1) {
                rtnArr = rtnArr.concat(JSON.parse(JSON.stringify(subArr.data)));
                parents.push(curParent);
            } else {
                if (argv[2] == "dev") console.log("found a existed bom level for top:" + curParent)
            }
            bomtopArr.pop();
            continue;
        } else {
            return {
                data: JSON.parse(JSON.stringify(rtnArr)),
                count: rtnCount
            }
        }

        i++;

    }
    //if (argv[2] == "dev") console.log("return array for " + bom_top, rtnArr);
    return {
        data: JSON.parse(JSON.stringify(rtnArr)),
        count: rtnCount
    };
}

function generateSQL(bom) {
    var sql_insert = "insert into dbo.st_goodsbom (goodsid, elemgid, quantity, mnfqty, masterqty, usetime, wasterate, memo,  state, pretime, itemno, ptype,pfep, opid, checkorid) values ";
    var sql_delete = "delete from dbo.st_goodsbom where "
    for (var i = 0; i < bom.length; i++) {
        sql_insert += "('" + bom[i].parent + "','" + bom[i].code + "'," + bom[i].qty + "," + bom[i].qty + ", 1, 1, 0, NULL,  1, 0, " + bom[i].item + ",'" + bom[i].procumenttype + "','" + bom[i].pfep + "', " + user.id + ", " + user.id + ")";
        sql_delete += "(goodsid = '" + bom[i].parent + "' and elemgid='" + bom[i].code + "')";
        if (i != bom.length - 1) {
            sql_insert += ", ";
            sql_delete += " or ";
        }
    }
    sql_insert += "; insert into st_bomtop (goodsid) values ( '" + bom_top + "');";
    sql_delete += "; delete from st_bomtop where goodsid='" + bom_top + "';";
    addResultText("<div class='alert alert-success' role='alert'>数据库语句已经生成。</div>");
    var moment = require('moment');
    var id = sqlite.insert('bom', {
        time: moment().format("YYYY-MM-DD HH:mm:ss"),
        bom_top: bom_top,
        sql_insert: sql_insert,
        sql_delete: sql_delete,
        stat: 0,
        remark: "new bom @" + moment().format("YYMMDD_HHmmss"),
        json_bom: JSON.stringify(bom),
        json_excel: JSON.stringify(bomexcel_arr),
        rows: bom.length
    });
    addResultText("<div class='alert alert-success' role='alert'>数据库语句已经存储。</div>");
    return id;
}

function savegoback(id) {
    addResultText('<input class="form-control" meta="bom_name" placeholder="命名本次导入内容" value="">');
    addResultText('<button type="submit" class="btn btn-form btn-primary btn-sm" meta="next" step="3">更名并返回控制台</button>');
    $("button[meta=next][step=3]").on("click", () => {
        var name = $("input[meta=bom_name]").val().trim();
        if (name.length == 0) {
            popup("命名错误，请检查后重试", "danger");
            return;
        }
        sqlite.update("bom", {
            remark: name
        }, {
            sn: id
        });
        loadPanel("dashboard");
    });
}