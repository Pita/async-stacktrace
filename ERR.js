/*
 * 2011 Peter 'Pita' Martischka
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var header = "Async Stacktrace:";

function ERR(err, callback, asyncStackLine)
{
  //there is a error
  if(err != null)
  {
    // determine the new stacktrace line
    if (!asyncStackLine)
      asyncStackLine = new Error().stack.split("\n")[2];

    //if only the callback function is passed
    if(typeof err == "function")
    {
      //wrap callback so ERR() is eventually called w/ the cached stacktrace line
      callback = err;
      return function(err) {
        if (ERR(err, callback, asyncStackLine)) return;
        callback.apply(this, arguments);
      };
    }
    //if there is already a stacktrace avaiable
    else if(err.stack != null)
    {
      //split stack by line
      var stackParts = err.stack.split("\n");
      
      //check if there is already a header set, if not add one and a empty line
      if(stackParts[0] != header)
      {
        stackParts.unshift(header,""); 
      }
      
      //add a new stacktrace line
      stackParts.splice(1,0,asyncStackLine);
      
      //join the stacktrace
      err.stack = stackParts.join("\n");
    }
    //no stacktrace, so lets create an error out of this object
    else
    {
      err = new Error(err);
    }
  
    //there is a callback, lets call it
    if(callback != null)
    {
      callback(err);
    }
    //no callback, throw the error
    else
    {
      throw err;
    }
  }
  
  //return true if an error happend
  return err != null;
}

module.exports = ERR;