/**
Core script to handle the entire theme and core functions
**/
var QuickSidebar = function () {
    //console.log($rootScope);
    

    // Handles quick sidebar toggler
    var handleQuickSidebarToggler = function () {
        // quick sidebar toggler
        $('.top-menu .dropdown-quick-sidebar-toggler a, .page-quick-sidebar-toggler').click(function (e) {
            $('body').toggleClass('page-quick-sidebar-open'); 
        });
    };

    // Handles quick sidebar chats
    var handleQuickSidebarChat = function () {
        var wrapper = $('.page-quick-sidebar-wrapper');
        var wrapperChat = wrapper.find('.page-quick-sidebar-chat');

        var initChatSlimScroll = function () {
            var chatUsers = wrapper.find('.page-quick-sidebar-chat-users');
            var chatUsersHeight;

            chatUsersHeight = wrapper.height() - wrapper.find('.nav-justified > .nav-tabs').outerHeight();

            // chat user list 
            Metronic.destroySlimScroll(chatUsers);
            chatUsers.attr("data-height", chatUsersHeight);
            Metronic.initSlimScroll(chatUsers);

            var chatMessages = wrapperChat.find('.page-quick-sidebar-chat-user-messages');
            var chatMessagesHeight = chatUsersHeight - wrapperChat.find('.page-quick-sidebar-chat-user-form').outerHeight() - wrapperChat.find('.page-quick-sidebar-nav').outerHeight();

            // user chat messages 
            Metronic.destroySlimScroll(chatMessages);
            chatMessages.attr("data-height", chatMessagesHeight);
            Metronic.initSlimScroll(chatMessages);
        };

        initChatSlimScroll();
        Metronic.addResizeHandler(initChatSlimScroll); // reinitialize on window resize

        wrapper.find('.page-quick-sidebar-chat-users .media-list > .media').click(function () {
            
                $('#message_'+ this.getAttribute("data-id")).removeClass("hidden");
                $('.page-quick-sidebar-back-to-list').attr('data-id',this.getAttribute('data-id'));
            wrapperChat.addClass("page-quick-sidebar-content-item-shown");
        });

        wrapper.find('.page-quick-sidebar-chat-user .page-quick-sidebar-back-to-list').click(function () {
           
            $('#message_' + this.getAttribute('data-id')).addClass('hidden');
           // $('#message_'+ this.getAttribute("data-id")).addClass("hidden");
            wrapperChat.removeClass("page-quick-sidebar-content-item-shown");
        });

        var handleChatMessagePost = function (e) {
            e.preventDefault();

            var chatContainer = wrapperChat.find(".page-quick-sidebar-chat-user-messages");
            var input = wrapperChat.find('.page-quick-sidebar-chat-user-form .form-control');

            var text = input.val();
            if (text.length === 0) {
                return;
            }

            var preparePost = function(dir, time, name, avatar, message) {
                

                var tpl = '';
                tpl += '<div class="post '+ dir +'">';
                //tpl += '<img class="avatar" alt="" src="' + Layout.getLayoutImgPath() + avatar +'.jpg"/>';
                tpl += '<div class="message">';
                tpl += '<span class="arrow"></span>';
                tpl += '<a href="#" class="name">Bob Nilson</a>&nbsp;';
                tpl += '<span class="datetime">' + time + '</span>';
                tpl += '<span class="body">';
                tpl += message;
                tpl += '</span>';
                tpl += '</div>';
                tpl += '</div>';

                return tpl;
            };

            // handle post
           
            var receiver = $('.page-quick-sidebar-back-to-list').attr('data-id');
            var time = new Date();
            var message = preparePost('out', (time.getHours() + ':' + time.getMinutes()), "Bob Nilson", 'avatar3', text);
            message = $(message);
            
            var msg = {
            message: text,
            id: receiver,
            color : 'FF7000',
            token: localStorage.jwtToken

            };
            //convert and send data to server

            var chatContainer = wrapperChat.find(".page-quick-sidebar-chat-user-messages #message_" + receiver);
            

            websocket.send(JSON.stringify(msg));
            chatContainer.append(message);

            var getLastPostPos = function() {
                var height = 0;
                chatContainer.find(".post").each(function() {
                    height = height + $(this).outerHeight();
                });

                return height;
            };           

            chatContainer.slimScroll({
                scrollTo: getLastPostPos()
            });

            input.val("");

            // simulate reply
            // setTimeout(function(){
            //     var time = new Date();
            //     var message = preparePost('in', (time.getHours() + ':' + time.getMinutes()), "Ella Wong", 'avatar2', 'Lorem ipsum doloriam nibh...');
            //     message = $(message);
            //     chatContainer.append(message);

            //     chatContainer.slimScroll({
            //         scrollTo: getLastPostPos()
            //     });
            // }, 3000);
        };

        wrapperChat.find('.page-quick-sidebar-chat-user-form .btn').click(handleChatMessagePost);
        wrapperChat.find('.page-quick-sidebar-chat-user-form .form-control').keypress(function (e) {
            if (e.which == 13) {
                handleChatMessagePost(e);
                return false;
            }
        });
/**
            var wsUri = "ws://localhost:9000";  
    websocket = new WebSocket(wsUri); 
    websocket.onclose   = function(ev){
        console.log("onclose");
    }; 
    websocket.onerror   = function(ev){
       
        console.log("onerror");
    }; 


    websocket.onopen = function(ev) {
        console.log("connected to socket");
        var msg = {
            message: "text",
            id: "test",
            color : 'FF7000',
            token: localStorage.jwtToken

            };
            
            websocket.send(JSON.stringify(msg));
    }
        websocket.onmessage = function(ev) {


                function getById(id, myArray) {
                   return myArray.filter(function(obj) {
                     if(obj.id == id) {
                       return obj 
                     }
                   })[0]
                 }


        console.log(ev.data);
        var msg = JSON.parse(ev.data); //PHP sends Json data
        var type = msg.type; //message type
        var umsg = msg.message; //message text
        var receiver = msg.id; //user name
        var ucolor = msg.color; //color
        var time = new Date();
        var me = getById(receiver,JSON.parse(localStorage.members));
        
       // var message = preparePost('in', (time.getHours() + ':' + time.getMinutes()), "Ella Wong", 'avatar2', 'Lorem ipsum doloriam nibh...');
        //(dir, time, name, avatar, message)
        var tpl = '';
        tpl += '<div class="post in">';
       // tpl += '<img class="avatar" alt="" src="' + Layout.getLayoutImgPath() +'avatar2.jpg"/>';
        tpl += '<div class="message">';
        tpl += '<span class="arrow"></span>';
        if(me != undefined){

        tpl += '<a href="#" class="name">' + me.fname + " " + me.mname + " " + me.lname + '</a>&nbsp;';
        }
        //tpl += '<span class="datetime">' + (time.getHours() + ':' + time.getMinutes()) + '</span>';
        tpl += '<span class="body">';
        tpl += umsg;
        tpl += '</span>';
        tpl += '</div>';
        tpl += '</div>';

        var message =  tpl;


        message = $(message);
        var wrapper = $('.page-quick-sidebar-wrapper');
        var wrapperChat = wrapper.find('.page-quick-sidebar-chat');
        wrapperChat.find(".page-quick-sidebar-chat-user-messages  #message_" + receiver).append(message);
       
    }; */
    };




    // Handles quick sidebar tasks
    var handleQuickSidebarAlerts = function () {
        var wrapper = $('.page-quick-sidebar-wrapper');
        var wrapperAlerts = wrapper.find('.page-quick-sidebar-alerts');

        var initAlertsSlimScroll = function () {
            var alertList = wrapper.find('.page-quick-sidebar-alerts-list');
            var alertListHeight;

            alertListHeight = wrapper.height() - wrapper.find('.nav-justified > .nav-tabs').outerHeight();

            // alerts list 
            Metronic.destroySlimScroll(alertList);
            alertList.attr("data-height", alertListHeight);
            Metronic.initSlimScroll(alertList);
        };

        initAlertsSlimScroll();
        Metronic.addResizeHandler(initAlertsSlimScroll); // reinitialize on window resize
    };

    //Handles quick sidebar settings
    var handleQuickSidebarSettings = function () {
        var wrapper = $('.page-quick-sidebar-wrapper');
        var wrapperAlerts = wrapper.find('.page-quick-sidebar-settings');

        var initSettingsSlimScroll = function () {
            var settingsList = wrapper.find('.page-quick-sidebar-settings-list');
            var settingsListHeight;

            settingsListHeight = wrapper.height() - wrapper.find('.nav-justified > .nav-tabs').outerHeight();

            // alerts list 
            Metronic.destroySlimScroll(settingsList);
            settingsList.attr("data-height", settingsListHeight);
            Metronic.initSlimScroll(settingsList);
        };

        initSettingsSlimScroll();
        Metronic.addResizeHandler(initSettingsSlimScroll); // reinitialize on window resize
    };

    return {

        init: function () {
            //layout handlers
            handleQuickSidebarToggler(); // handles quick sidebar's toggler
            handleQuickSidebarChat(); // handles quick sidebar's chats
            handleQuickSidebarAlerts(); // handles quick sidebar's alerts
            handleQuickSidebarSettings(); // handles quick sidebar's setting
        }
    };

}();