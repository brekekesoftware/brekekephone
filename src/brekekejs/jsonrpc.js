/* eslint-disable */

if (!window.Brekeke) {
  window.Brekeke = {}
}
var Brekeke = window.Brekeke

Brekeke.net = {
  ERROR_TIMEOUT: -1,
  ERROR_DISCONNECTED: -2,
  ERROR_NOT_OPENED: -3,
  ERROR_UNKNOWN_RESPONSE: -4,
  WebSocket: window.WebSocket || window.MozWebSocket,
  createJsonRpc(websocketURL, ajaxURL) {
    return (
      this.createJsonRpcOverWebSocket(websocketURL) ||
      this.createJsonRpcOverAjax(ajaxURL)
    )
  },
  getJsonRpcPrototype() {
    if (Brekeke.net.prototype_jsonrpc) {
      return Brekeke.net.prototype_jsonrpc
    }
    var rpc = {
      timeoutMethod: 10000,
      method_id: 1,
      debugLevel: 0, // 0: release, 1:dev, 2:debug for all messages.
      timeLastReceived: 0,
      call(method, params, funcOK, funcError, returnObj) {
        if (funcOK) {
          var mid = this.method_id++
          mid = mid.toString()
          var obj_send = {
            jsonrpc: '2.0',
            method,
            params,
            id: mid,
          }
          this._sendMethod(obj_send, mid, funcOK, funcError, returnObj)
        } else {
          var obj_send = {
            jsonrpc: '2.0',
            method,
            params,
          }
          this._sendNotification(obj_send)
        }
      },
      printDebug(str) {
        if (this.debugLevel >= 2) {
          if (typeof str === 'object') {
            str = JSON.stringify(str)
          }
          console.debug(str)
        }
      },
      printError(str) {
        if (this.debugLevel >= 1) {
          if (typeof str === 'object') {
            str = JSON.stringify(str)
          }
          console.debug(str)
        }
      },
      _sendMethod(obj_send, mid, funcOK, funcError, returnObj) {
        if (!this.isOpen()) {
          funcError('Not Opened', Brekeke.net.ERROR_NOT_OPENED, returnObj)
          return
        }
        this.methods_sending[mid] = {
          funcOK,
          funcError,
          returnObj,
          obj_send,
        }
        var s = JSON.stringify(obj_send)
        this.printDebug('JsonRpcBase._sendMethod:' + s)
        this.send(s)
        var t = this
        setTimeout(function () {
          //                    t.printError("JsonRpcBase._sendMethod: timeout " + mid);
          var m = t.methods_sending[mid]
          if (m) {
            t.printError('JsonRpcBase._sendMethod 2: timeout ' + mid)
            m.funcError(
              { code: Brekeke.net.ERROR_TIMEOUT, message: 'Response Timeout' },
              m.returnObj,
            )
            delete t.methods_sending[mid]
          }
        }, t.timeoutMethod)
      },
      _sendNotification(obj_send) {
        var s = JSON.stringify(obj_send)
        this.printDebug('JsonRpcBase._sendNotify:' + s)
        this.send(s)
      },
      _recvOneMsg(msg) {
        if (msg.id) {
          //
          if (msg.method) {
            // method
            var ret = this._recvMethod(msg.method, msg.params)
            var resmsg = {
              jsonrpc: '2.0',
              result: ret,
              id: msg.id,
            }
            var sresmsg = JSON.stringify(resmsg)
            this.printDebug(
              'JsonRpcBase._recvOneMsg.  method response:' + sresmsg,
            )
            this.send(sresmsg)
          } else {
            // response
            var m = this.methods_sending[msg.id]
            if (m) {
              if (msg.result !== undefined) {
                m.funcOK(msg.result, m.returnObj)
              } else if (msg.error) {
                m.funcError(msg.error, m.returnObj)
              }
              delete this.methods_sending[msg.id]
            } else {
              this.printError(
                'JsonRpcBase.recvOneMsg: no method data found. already timeout? ',
                msg,
              )
              this.onError(msg)
            }
          }
        } else {
          // got notify
          if (msg.method) {
            this._recvNotification(msg.method, msg.params)
          } else {
            // {"jsonrpc":"2.0","error":{"code":-2022,"message":"Login failed (4)"},"id":null}
            this.onError(msg)
          }
        }
      },
      _recv(msg) {
        this.timeLastReceived = new Date().getTime()
        this.printDebug(msg)
        if (msg instanceof Array) {
          for (var i = 0; i < msg.length; i++) {
            this._recvOneMsg(msg[i])
          }
        } else {
          this._recvOneMsg(msg)
        }
      },
      _recvNotification(method, params) {
        var hobj = this._getHandlerObject()
        var handler = hobj[method]
        if (handler) {
          handler.apply(hobj, [params])
          //handler(params, false);
        } else {
          this._getHandlerObject().handler(method, params, false)
        }
      },
      _recvMethod(method, params) {
        var hobj = this._getHandlerObject()
        var handler = hobj[method]
        if (handler) {
          return handler.apply(hobj, [params, true])
          //return handler(params, true);
        } else {
          return hobj.handler(method, params, true)
        }
      },
      //
      handler(msg) {
        this.printError('no handler found. ' + msg)
      },
      onClose() {},
      _onClose(e) {
        if (this.closed) {
          return
        }
        this.closed = true
        this.onClose(e)
      },
      onOpen() {},
      _onOpen() {
        this.onOpen()
      },
      send() {},
      setHandlerObject(h) {
        this.handlerObject = h
      },
      _getHandlerObject() {
        return this.handlerObject ? this.handlerObject : this
      },
      _canOpen() {
        if (this.closed) {
          this.printDebug('Already Closed.')
          return false
        }
        if (this.methods_sending) {
          this.printDebug('Already Opened.')
          return false
        }
        this.methods_sending = {}
        this.closing = false
        this.closed = false
        return true
      },
      setUrl(url) {
        this.url = url
      },
      onError(e) {
        console.log('error', e)
      },
    }
    Brekeke.net.prototype_jsonrpc = rpc
    return Brekeke.net.prototype_jsonrpc
  },
  getJsonRpcOverWebSocketPrototype() {
    if (!Brekeke.net.WebSocket) {
      return null
    }
    if (Brekeke.net.prototype_jsonrpc_websocket) {
      return Brekeke.net.prototype_jsonrpc_websocket
    }
    var rpc = Object.create(Brekeke.net.getJsonRpcPrototype())
    rpc.isOpen = function () {
      this.printDebug(
        'JsonRpcOverWebSocket.isOpen() rpc.socket.readyState=' +
          this.socket.readyState,
      )
      return this.socket.readyState === 1
    }
    rpc.send = function (msg) {
      this.socket.send(msg)
    }
    rpc.open = function () {
      if (!this._canOpen()) {
        throw new Error('Failed to open')
      }
      var socket = new WebSocket(this.url)
      this.socket = socket
      var t = this
      socket.onopen = function (e) {
        t.printDebug('JsonRpcOverWebSocket.open() onopen:' + e)
        t._onOpen()
      }
      socket.onclose = function (e) {
        for (var id in t.methods_sending) {
          var m = t.methods_sending[id]
          m.funcError(
            { code: Brekeke.net.ERROR_DISCONNECTED, message: 'Disconnected' },
            m.returnObj,
          )
        }
        delete this.methods_sending
        t.methods_sending = {}
        t._onClose(e)
      }
      socket.onmessage = function (e) {
        if (!e) {
          return
        }
        if (!e.data || e.data.length == 0) {
          return
        }
        var msg = JSON.parse(e.data)
        t._recv(msg)
      }
      socket.onerror = function (e) {
        t.printDebug(e)
        t.onError(e)
      }
    }
    rpc.close = function () {
      if (!this.socket) {
        return
      }
      this.socket.close()
      this.socket = null
    }
    rpc.onerror = function (e) {
      this.onError(e)
    }
    Brekeke.net.prototype_jsonrpc_websocket = rpc
    return Brekeke.net.prototype_jsonrpc_websocket
  },
  createXhr() {
    var MSXML_PROGID = [
      'Microsoft.XMLHTTP',
      'MSXML2.XMLHTTP.3.0',
      'MSXML2.XMLHTTP',
    ]
    var xhr
    try {
      xhr = new XMLHttpRequest()
      //	    xhr = new XMLHttpRequest() || new ActiveXObject("Msxml2.XMLHTTP")
      //		    || new ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) {
      for (var i = 0; i < MSXML_PROGID.length; i++) {
        try {
          xhr = new ActiveXObject(MSXML_PROGID[i])
          break
        } catch (e1) {}
      }
    } finally {
      if (!xhr) {
        throw new Error('Could not create Xhr object.')
      }
      if (xhr.overrideMimeType) {
        xhr.overrideMimeType('text/xml')
      }
      //	    xhr.withCredentials = true; //must be opened.
      return xhr
    }
  },
  getJsonRpcOverAjaxPrototype() {
    if (Brekeke.net.prototype_jsonrpc_ajax) {
      return Brekeke.net.prototype_jsonrpc_ajax
    }
    var rpc = Object.create(Brekeke.net.getJsonRpcPrototype())
    rpc.open = function () {
      if (!this._canOpen()) {
        throw new Error('Failed to open')
      }
      this.polling()
      return true
    }
    rpc.isOpen = function () {
      //            this.printDebug("JsonRpcOverAjax.isOpen()");
      return this.methods_sending && !this.closing && !this.closed
    }

    rpc.polling = function () {
      if (this.closing) {
        return
      }
      var xhr = Brekeke.net.createXhr()
      var t = this
      xhr.onreadystatechange = function () {
        if (xhr.readyState >= 4) {
          if (xhr.status === 200) {
            if (xhr.responseText) {
              if (!t.bOpened) {
                t.bOpened = true
                t._onOpen()
              }
              t._recv(JSON.parse(xhr.responseText))
            }
            t.polling()
          } else if (xhr.status === 500) {
            try {
              throw {
                value: 500,
                message: 'Internal Server Error.()', //"Internal Server Error",
                toString() {
                  return this.value + this.message
                },
              }
            } catch (e) {
              t.onError(e)
            }
            t._onClose(xhr.status)
          } else {
            t._onClose(xhr.status)
          }
          t.xhr_r = null
        } else {
        }
      }
      xhr.open('POST', this.url, true)
      xhr.withCredentials = true
      xhr.setRequestHeader('Content-Type', 'text/plain')
      xhr.send()
      this.xhr_r = xhr
    }
    rpc.send = function (msg) {
      if (this.closing || this.closed) {
        return
      }
      var xhr = Brekeke.net.createXhr()
      var t = this
      xhr.onreadystatechange = function () {
        if (xhr.readyState >= 4) {
          if (xhr.status === 200) {
            if (xhr.responseText) {
              t._recv(JSON.parse(xhr.responseText))
            }
          } else {
            t._onClose(xhr.status)
          }
        } else {
        }
      }
      xhr.open('POST', this.url, true)
      xhr.withCredentials = true
      if (msg) {
        xhr.setRequestHeader('Content-Type', 'text/plain')
      }
      xhr.send(msg)
    }
    rpc.close = function () {
      this.closing = true
      if (this.xhr_r) {
        this.xhr_r.abort()
      }
      this._onClose()
    }
    rpc.onerror = function (e) {
      this.onError(e)
    }
    Brekeke.net.prototype_jsonrpc_ajax = rpc
    return Brekeke.net.prototype_jsonrpc_ajax
  },
  createJsonRpcOverWebSocket(url) {
    var r = Object.create(Brekeke.net.getJsonRpcOverWebSocketPrototype())
    r.setUrl(url)
    return r
  },
  createJsonRpcOverAjax(url) {
    var r = Object.create(Brekeke.net.getJsonRpcOverAjaxPrototype())
    r.setUrl(url)
    return r
  },
}
