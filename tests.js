var vows = require('vows');
var assert = require('assert');
var ERR = require("./ERR");

var emptyFunc = function(){};

vows.describe('ERR function').addBatch({
  'when its loaded' : {
    topic: function() {
      return require("./ERR");
    },
    
    'it returns the ERR function': function(topic){
      assert.equal(typeof topic, "function");
    },
    
    'its not global': function(topic){
      assert.isUndefined(global.ERR);
    }
  }
}).addBatch({
  'when you call it without an error' : {
    'it returns false' : function() {
      assert.isFalse(ERR());
    }
  },
  'when you call it with an error' : {
    'it returns true' : function() {
      assert.isTrue(ERR(new Error(), emptyFunc));
    }
  },
  'when you give it a callback and an error': {
    'it calls the callback with the error' : function() {
      ERR(new Error(), function(err) {
        assert.isNotNull(err);
      });
    }
  },
  'when you give it no callback and an error': {
    'it throws the error' : function() {
      var wasThrown = false;
      
      try
      {
        ERR(new Error());
      }
      catch(e)
      {
        wasThrown = true;
      }
      
      assert.isTrue(wasThrown);
    }
  },
  'when you call it with a string as an error' : {
    'it uses the string as an error message' : function(){
      var errStr = "testerror";
      var err;
      ERR(errStr, function(_err){
        err = _err;
      });
      
      assert.equal(err.message, errStr);
    }
  },
  'when you give it a non-async stacktrace': {
    'it turns it into an async stacktrace' : function(){
      var errorBefore = new Error();
      var stackLinesBefore = errorBefore.stack.split("\n").length;
      var errorAfter;
      
      ERR(errorBefore, function(err){
        errorAfter = err;
      });
      
      var stackLinesAfter = errorAfter.stack.split("\n").length;
      
      assert.equal(stackLinesBefore+3, stackLinesAfter);
    }
  },
  'when you give it a async stacktrace': {
    'it adds a new stack line' : function(){
      var err = new Error();
      
      ERR(err, function(_err){
        err = _err;
      });
      
      var stackLinesBefore = err.stack.split("\n").length;
      
      ERR(err, function(_err){
        err = _err;
      });
      
      var stackLinesAfter = err.stack.split("\n").length;
      
      assert.equal(stackLinesBefore+1, stackLinesAfter);
    }
  },
  'when you call it with a callback as the only argument': {
    'it returns a wrapped callback': function() {
      var lineNumberRegex = /tests\.js:(\d+):\d+/;

      var err = new Error();
      var stackLinesBefore = err.stack.split("\n");
      var syncLineNumber = lineNumberRegex.exec(stackLinesBefore[1])[1];

      var stackLinesAfter;
      var asyncLineNumber;
      var wrappedCallback = ERR(function(_err) {
        stackLinesAfter = _err.stack.split("\n");
        asyncLineNumber = lineNumberRegex.exec(stackLinesAfter[1])[1];
      });

      wrappedCallback(err);
      assert.equal(stackLinesBefore.length+3, stackLinesAfter.length);

      // because `ERR(...)` is 6 lines after `new Error()` in this test
      assert.equal(parseInt(asyncLineNumber), parseInt(syncLineNumber)+6);
    }
  },
  'when you call it with a callback as the only argument then': {
    'the wrapping does not interfere with `this` binding or passed args': function() {
      var wrappedCallback = ERR(function(_err, arg1, arg2) {
        assert.equal(this, "test_this");
        assert.equal(err, null);
        assert.equal(arg1, "arg1");
        assert.equal(arg2, "arg2");
      });

      var err = null;
      wrappedCallback.call("test_this", err, "arg1", "arg2");
    }
  }
}).run();    
