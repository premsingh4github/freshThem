/***
Metronic AngularJS App Main Script
***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router", 
    "ui.bootstrap", 
    "oc.lazyLoad",  
    "ngSanitize",
    '720kb.datepicker',
    "angular-confirm",
    "toggle-switch",
    "ngMessages"
]);
MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);
MetronicApp.config(['$controllerProvider', function($controllerProvider) {
  $controllerProvider.allowGlobals();
}]);
MetronicApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        layoutImgPath: Metronic.getAssetsPath() + 'admin/layout/img/',
        layoutCssPath: Metronic.getAssetsPath() + 'admin/layout/css/'
    };

    $rootScope.settings = settings;

    return settings;
}]);

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.$on('$viewContentLoaded', function() {
        Metronic.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
    });
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial 
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */






/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', ['$scope', function($scope) {    
    $scope.$on('$includeContentLoaded', function() {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);
 // added by prem
 
 function authInterceptor(API, auth) {
   
   return {
     // automatically attach Authorization header
     request: function(config) {
       var token = auth.getToken();
       if (config.url.indexOf(API) === 0 && token) {
         config.headers.token = token;
       }

       return config;
     },

     // If a token was sent back, save it
     response: function(res) {
       if (res.config.url.indexOf(API) === 0 && res.data.token) {
         auth.saveToken(res.data.token);
       }
       return res;
     },
   }
 }

 function authService($window) {
  
   var self = this;

   self.saveToken = function(token) {
     $window.localStorage['jwtToken'] = token;
   }

   self.getToken = function() {
     return $window.localStorage['jwtToken'];
   }
   self.logout = function() {
     $window.localStorage.removeItem('jwtToken');
   }
 }

 function userService($http, API, auth,$state) {

   var self = this;
   self.getQuote = function() {
     return $http.post(API + '/getUser');
   }

   // add authentication methods here
   self.register = function($data) {

     return $http.post(API + 'register',{
       fname:$data.fname,
       mname:$data.mname,
       lname:$data.lname,
       address:$data.address,
       identity:$data.identity,
       nationality:$data.nationality,
       dob:$data.dob,
       ban:$data.ban,
       email:$data.email,
       cNumber:$data.contactNo,
       mNumber:$data.mobileNo,
       agent :$data.agent,
       branchId : $data.branch
     });
       
   }
   self.login = function(username, password) {
     return $http.post(API + 'login',{
       username:username,
       password:password
     });
   }
   self.getUnverifiedMember = function(){
     return $http.post(API + 'API/getUnverifiedMember');
   }
   self.getOnlineMember = function(){
        return $http.post(API + 'API/getOnlineMember');
   }
   self.verifyMember = function(member_id,username,password,mtype){
        return $http.post(API + 'API/verifyMember',{
                member_id:member_id,
                username:username,
                password:password,
                mtype:mtype
       });
    }
   self.isAuthed = function(){
     return $http.post(API + 'API/isAuthed');
   }
   self.logout = function(){
        return $http.post(API + 'API/logout');
   }
   self.addBranch = function(branch){
        return $http.post(API + 'API/createBranch',{
            branchName : branch.name,
            branchLocation : branch.location,
            delivery_charge : branch.delivery_charge
        });
   }
   self.editBranch = function(branch){
      return $http.post(API + 'API/editBranch',{
            branchId : branch.id,
            branchName : branch.name,
            branchLocation : branch.location,
            delivery_charge : branch.delivery_charge
      });
   }
   self.getBranch = function(){
    return $http.post(API + 'getBranch');
   }
   self.addStock = function(stockProduct){
        return $http.post(API + 'API/createStock',{
            branchId : stockProduct.branchId,
            productTypeId : stockProduct.productTypeId,
            stockTypeId : stockProduct.stockTypeId,
            onlineQuantity : stockProduct.onlineQuantity,
        });
   }
   self.getStocks = function(){
     return $http.post(API + 'API/getStocks');
   };
   self.addProduct = function(data){
        return $http.post(API + 'API/creatProduct',{
            name:data.name,
            lot_size: data.lotSize,
            commision: data.commision,
            margin: data.margin,
            holding_cost : data.holding_cost,
            producType : data.productType
        });
   };
   self.editProduct = function(data){
        return $http.post(API + 'API/editProduct',{
            productId : data.id,
            name:data.name,
            lot_size: data.lot_size,
            commision: data.commision,
            margin: data.margin,
            holding_cost : data.holding_cost,
            producType : data.type
        });
   };
   self.getProducts = function(){
     return $http.post(API + 'API/getProducts');
   };
   self.getMemberTypes = function(){
        return $http.post(API + 'API/getMemberTypes');
   }
   self.getMembers = function(){
        return $http.post(API + 'API/getMembers');
   }
    self.addAccount = function(data){
      debugger;
        return $http.post(API + 'API/addAccount',{
            memberId: data.memberId,
            type: data.account.type,
            amount: data.account.amount
        })
    }
    self.addClientStock = function(data){
        return $http.post(API + 'API/addClientStock',{
            stockId: data.clientStock.id,
            amount: data.amount,
            delivery_date : data.delivery_date
        })
    }
    self.addMember = function($data) {
      return $http.post(API + 'API/addMember',{
        fname:$data.fname,
        mname:$data.mname,
        lname:$data.lname,
        address:$data.address,
        identity:$data.identity,
        nationality:$data.nationality,
        dob:$data.dob,
        ban:$data.ban,
        email:$data.email,
        cNumber:$data.contactNo,
        mNumber:$data.mobileNo,
        mtype:$data.mtype,
        agent : $data.agent
      });
        
    }
    self.editMember = function($data){
       return $http.post(API + 'API/editMember',{
        memberId : $data.id,
        fname:$data.fname,
        mname:$data.mname,
        lname:$data.lname,
        address:$data.address,
        identity:$data.identity,
        nationality:$data.nationality,
        dob:$data.dob,
        ban:$data.ban,
        email:$data.email,
        cNumber:$data.cNumber,
        mNumber:$data.mNumber,
        mtype:$data.mtype,
        agent : $data.agent
      });
    }
    self.suspendMember = function(memberId){
      return $http.post(API + 'API/suspendMember',{
        memberId : memberId
      });
    }
    self.releaseMember = function(memberId){
      return $http.post(API + 'API/releaseMember',{
        memberId : memberId
      });
    }
    self.deleteMember = function(memberId){
      return $http.post(API + 'API/deleteMember',{
        memberId : memberId
      });
    }
   self.approveRequest = function(requestId,status){
      return $http.post(API +"API/approveRequest",{
        requestId:requestId,
        status : status
      });
   }
   self.getStockTypes = function(){
    return $http.post(API + "API/getStockTypes");
   }
   self.updateStock = function(data){
     return $http.post(API + "API/updateStock",{
        stockId : data.updateStock.id,
        quantity : data.Quantity
     });
   }
   self.sendNotice = function(notice){
      return $http.post(API + 'API/sendNotice',{
          for: notice.for,
          subject : notice.subject,
          body : notice.body
      });
   }
   self.getNotices = function(){
        return $http.post(API + 'API/getNotices');
   }
   self.changeServerStatus = function($status){
      return  $http.post(API + 'API/changeServerStatus',{
        status : $status
      });
   }
   self.addMarketOrder = function(order){
      return $http.post(API + 'API/addMarketOrder',{
        branchId : order.branch,
        productTypeId: order.symbol,
        lot: order.lot
      });
   }
   self.addLimitBuyOrder = function(order){
    return $http.post(API + 'API/addLimitBuyOrder',{
        branchId : order.branch,
        productTypeId: order.symbol,
        lot: order.lot,
        priceMax : order.priceMax,
        priceMin : order.priceMin
    });
   }
   self.addLimitSellOrder = function(order){
    return $http.post(API + 'API/addLimitSellOrder',{
        branchId : order.branch,
        productTypeId: order.symbol,
        lot: order.lot,
        priceMax : order.priceMax,
        priceMin : order.priceMin
    });
   } 
 }
 MetronicApp.factory('authInterceptor', authInterceptor);
 MetronicApp.service('user', userService);
 MetronicApp.service('auth', authService);
 //MetronicApp.constant('API', 'http://fwwmc.com.my/API/public/');
 //MetronicApp.constant('API', 'http://api.omnitextsolution.com/public/');
 MetronicApp.constant('API', 'http://localhost/edealer/public/');
 MetronicApp.constant('HOME','http://localhost/freshThem');
 MetronicApp.config(function($httpProvider) {
   $httpProvider.interceptors.push('authInterceptor');
 });



MetronicApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/login.html");  
    
    $stateProvider

        // Dashboard
        .state('login', {
            url: "/login.html",
            templateUrl: "views/login.html",
            controller:"loginController"
        })
        .state('home',{
            templateUrl:"views/loading.html",
            controller:'HomeController'
        })
        //register
        .state('register', {
            url: "/register.html",
            templateUrl: "views/register.html",
            controller:"RegisterController"

           
        })
        .state('dashboard',{
            url: "/dashboard.html",
            templateUrl: "views/dashboard.html",
            controller:"dashboardController"
        })
        .state('dashboard2',{
            url: "/dashboard2.html",
            templateUrl: "views/dashboard2.html"      
        })

}]);
MetronicApp.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state","user" ,function($rootScope, settings, $state,user) {
    //ng-init="switchStatus = true"
   
    user.isAuthed().then(function(res){
      if(res.data.code != 200){
          $state.go('login');
      }
      else{
        $state.go('home');
      }
    });
    $rootScope.$state = $state; // state to be accessed from view
}]);