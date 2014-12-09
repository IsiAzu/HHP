$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize varibles
  var $window = $(window);
  var $usernameInput = $('#name'); // Input for username
  var $usernumberInput = $('#number'); // Input for usernumber
  var $userHUngerInput = $('input[name=howhungry]:radio');
  var $userCuisineInput = $('.cuisine input:checked');
  var $userPriceInput = $('input[name=price]:radio');
  var $userPointInput = $('input[name=point]:radio');
  var $cpag = $('.create.page');
  var $hp1 = $('.hp1');
  var $hp2 = $('.hp2');
  var $opag = $('.ONE.page');
  var $tpag = $('.TWO.page');
  var $thpag = $('.THREE.page');
  var $fpag = $('.FOUR.page');
  var $hpag = $('.home.page');

  // Hide all divs on page
  //$cpag.hide();


  var un, unum, uh, uc, up, upo;
  un = false;
  unum = false;
  uh = false;
  uc = false;
  up = false;
  upo = false;

  var $messages = $('.messages'); // Messages area
  var $restaurant = $('.rest'); // restaurant area
  var $searchRestaurant = $('.restInput'); // Inout restaurant info
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $restInput = $('.restaurantChoice'); // get FINAL restaurant choice

  var $loginPage = $('.login.page'); // The login page
  var $num = $('#num'); // number
  var $nom = $('#nom'); // name
  var $chatPage = $('.chat.page'); // The chatroom page
  var chatTime = false;
  // Prompt for setting a username
  var username, usernumb;
  var connected = false;
  var typing = false;
  var uNInput = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  var userData = {};
  var inOrOut = null;
  //var socket = io.connect('/');


  var letsFood = function (tag) {
    console.log("someone want's " + tag);
    var data = {};
    data[tag.value] = tag.checked;
    //socket.emit('cuisinechosen', data);
  };
  var getCuisineChoice = function () {
    var checkedValues = [];
    var cuisineELements = document.getElementsByClassName('cuisine');
    for (var i = 0; cuisineELements[i]; i++){
      if(cuisineELements[i].checked){
        checkedValues.push(cuisineELements[i].value);
      }
    }
    //console.log(checkedValues);
    //userData.Cuisine = checkedValues;
    //emit here
    return checkedValues;
  };
  var getHungerChoice = function(){
    var radios = document.getElementsByName('howhungry');

    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        userData.Hunger = radios[i].value;
        // only one radio can be logically checked, don't check the rest
        break;
      }
    }
  };
  var getPriceChoice = function(){
    var radios = document.getElementsByName('price');

    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        userData.Price = radios[i].value;
        // only one radio can be logically checked, don't check the rest
        break;
      }
    }

  };
  var getPointChoice = function(){
    var radios = document.getElementsByName('point');

    for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
        userData.Point = radios[i].value;
        // only one radio can be logically checked, don't check the rest
        break;
      }
    }
  };
  var getUserInfo = function () {
    var name = document.getElementById('name').value;
    var number = document.getElementById('number').value;
    userData.UserName = name;
    userData.UserNumber = number;
  }; // NO NEED CHANGED TO JQUERY
  var getGroupName = function () {
    var g = document.getElementById('groupname').value;
    userData.groupname = g;
  }; //NO NEED
  var checkLink = function (){
    var link = document.getElementById('link').value;
    // check the database for the group order
  }; // DEAL
  var emitGroupDat = function(gdata){
    console.log(gdata);
    socket.emit('neworderreq', gdata);

    // join room
    // reveal chat, log user to chat, show user data
    displayUserInfo(gdata);
  }; // DEAL
  var displayUserInfo = function(data){

    var usernode = document.createElement("th");
    var utextnode = document.createTextNode(data.UserName);
    usernode.appendChild(utextnode);

    var usercuisine = document.createElement("td");
    var uCtextnode = document.createTextNode(data.Cuisine);
    usercuisine.appendChild(uCtextnode);

    var userprice = document.createElement("td");
    var uPtextnode = document.createTextNode(data.Price);
    userprice.appendChild(uPtextnode);

    var userhunger = document.createElement("td");
    var uHtextnode = document.createTextNode(data.Hunger);
    userhunger.appendChild(uHtextnode);

    document.getElementById("username").appendChild(usernode);
    document.getElementById("cuisine_choices").appendChild(usercuisine);
    document.getElementById("price_range").appendChild(userprice);
    document.getElementById("hungerRange").appendChild(userhunger);
    //opt out turn div red
    //ready turn div green

  }; //DEAL WITH THIS
  function doSearch() {
    var targetTable = document.getElementById('');
    var targetTableColCount;

    //Loop through table rows
    for (var rowIndex = 0; rowIndex < targetTable.rows.length; rowIndex++) {
      var rowData = '';

      //Get column count from header row
      if (rowIndex == 0) {
        targetTableColCount = targetTable.rows.item(rowIndex).cells.length;
        continue; //do not execute further code for header row.
      }

      //Process data rows. (rowIndex >= 1)
      for (var colIndex = 0; colIndex < targetTableColCount; colIndex++) rowData += targetTable.rows.item(rowIndex).cells.item(colIndex).textContent;

      //If search term is not found in row data
      //then hide the row, else show
      if (rowData.indexOf(userData.UserName) != -1) setStatus();

    }
  } //THIS TOO
  // set user optIn/Out
  var setStatus = function(element){
    //checking the status of user
    // might have to first link client ID to user data in db
    if(inOrOut == false){
      element.style.background = "red";
    }else if (inOrOut == true){
      element.style.background = "green";
    }else{
      element.style.background = "white";
    }
  }; //DITTO
  // on ready (opt in)
  var ready = function(){
    if(inOrOut == null || inOrOut == false){
      inOrOut = true;
    }
    //append user data here
    //emit data

    var usrP = document.createElement("p");
    var userTnode = document.createTextNode(userData.UserName);
    usrP.appendChild(userTnode);
    document.getElementById("red").appendChild(userTnode);
    //remove ready button

    socket.emit('ready', userData.UserName);


  }; //DITTO2
  // on opt out
  var optOut = function(){
    if(inOrOut == null || inOrOut == true){
      inOrOut = false;
    }

    var usrP = document.createElement("p");
    var userTnode = document.createTextNode(userData.UserName);
    usrP.appendChild(userTnode);
    document.getElementById("oout").appendChild(userTnode);
    //remove opt out button

    socket.emit('ready', userData.UserName);

  }; //DITTTTOOOO
  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "There is 1 hungry person here";
    } else {
      message += "there are " + data.numUsers + " hungry people here";
    }
    log(message);
  }
  // Sets the client's username

  function createPage(){
    $hp1.click(function(){
      $hpag.fadeOut();
      $hp1.off('click');
      $hp2.off('click');
      $nom.show();
    });
  }

  function setUsername () {
    username = cleanInput($usernameInput.val().trim());
    $('#next1').click(function(){
      $nom.fadeOut();
      $num.show();
      $nom.off('click');
      $currentInput = $num.focus();
      // put username in database object
      userData.UserName = username;
      un = false;
      unum = true;
      //socket.emit('send user', username); // from 'add user to send user
    });
}

  function setUsernumber (){
  usernumb = cleanInput($usernumberInput.val().trim());
  $('#next2').click(function(){
    $num.fadeOut();
    $opag.show();
    $nom.off('click');
    $currentInput.blur();
    // put number in dataase object
    userData.UserNumber = usernumb;
    // Tell the server user name/number
    //socket.emit('add user number', usernumb);  // user number emit
    unum = false;
    uh = true;
  });
}

  function setUserHunger (){
    var value;
    $userHUngerInput.click(function(){
      value = $(this).val();
    });

    $('#nextONE').click(function(){
      $opag.fadeOut();
      $thpag.show();
      $userHUngerInput.off('click');
      userData.Hunger = value;
      //socket.emit('add user hunger', value);
      uh = false;
      uc = true;
    });
  }

  function setUserCuisine(){
     // get values from check boxes and put in array values
    $('#nextTHREE').click(function(){
      var value = getCuisineChoice();
      console.log(value); // on click next do...
      $thpag.fadeOut();
      $tpag.show();
      //console.log(value);
      userData.Cuisine = value;
      //socket.emit('add user cuisine', value);
      uc = false;
      up = true;
    });
  }

  function setUserPrice(){
    var value;
    $userPriceInput.click(function(){
      value = $(this).val();
    });                                     // on click next do...
    $('#nextTWO').click(function(){
      $tpag.fadeOut();
      $fpag.show();
      $userPriceInput.off('click');
      userData.Price = value;
      //socket.emit('add user price', value);
      up = false;
      upo = true;
    });
  }

  function setUserPoint(){
    var value;
    $userPointInput.click(function(){
      value = $(this).val();
    });

    // on click next do...
    $('#nextFOUR').click(function(){
      $fpag.fadeOut();
      $cpag.show(); // To join chat
      $userPointInput.off('click');
      userData.Point = value; // Tell the server user name/number
      //socket.emit('add user point', value);  // user number emit
      upo = false;
    });
  }

  function emitAllData(){
    // send all user data stored in userData to db
    // add user to the chat room
    $cpag.click(function(){
      socket.emit('add user', userData);
      console.log(userData);
      $cpag.hide();
      $chatPage.show();
    });
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        //setUsername();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "You are not the only hungry person here, get ordering!";
    log(message, {
      prepend: true
    });
    addParticipantsMessage(data);
    // check for current users, ready, opted out, append info

  });

  // Receive user data from any event
  socket.on('neworderreq', function (data) {
    console.log(data);
    // emit user dat
    displayUserInfo(data);
  });

  socket.on('useroptout', function(data){
    // remove this user's data from list
    // or ad user's info to opt out list
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    log(data.username + ' joined');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    log(data.username + ' left');
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

  $(document).ready(function(){
    $nom.hide();
    $num.hide();
    $opag.hide();
    $tpag.hide();
    $thpag.hide();
    $fpag.hide();
    $cpag.hide();

    createPage();
    setUsername();
    setUsernumber();
    setUserCuisine();
    setUserHunger();
    setUserPrice();
    setUserPoint();
    emitAllData();

  });

});


