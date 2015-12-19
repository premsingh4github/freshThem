MetronicApp.controller('loginController', ['$scope','user','auth','$state','$rootScope', function($scope,user,auth,$state,$rootScope) {
  
  if($rootScope.logined != undefined){
    $state.go('home');
  }
   user.isAuthed().then(function(res){
     if(res.data.code == 200){
      $rootScope.logined = true;
         $state.go('home');
     }
   });  
   $scope.register = function(){
     $state.go('register');
   };
   $scope.login = function() {
     $scope.submitted = true;
     if ($scope.userForm.$valid) {      
       user.login($scope.name, $scope.password)
       .then(handleRequest, handleRequest);
       $scope.token = localStorage.jwtToken;
     } else {
      //$scope.error = ""
     }
     
   };
   function handleRequest(res) {
   // alert(1);
    if(res.data.code == 200){
      var token = res.data ? res.data.token : null;
     if(token) { 
        $state.go('home');
        }
    }
    else if(res.status == 401){
      $scope.error = "Invalid Credential";

    }
    else{
      $scope.error = "Server Error";
    }
     
   
   }
   $scope.token = localStorage.jwtToken;
   $scope.logout = function(){
     delete localStorage.jwtToken;
   }
   $scope.request = function(){
     user.getQuote()
       .then(handleRequest, handleRequest)
   }
}]);

MetronicApp.controller('RegisterController',register);
function register($state,$scope,user,pubsubService){
     
    user.getBranch().then(function(res){
      $scope.branches = res.data.branches;
    },function(res){

    });
  $scope.isDone = false;
  $scope.cancel = function(){
    $state.go('login');
  }
  $scope.register = function($valid){
    $scope.submitted = true;
    if($valid){
     user.register($scope).then(function(res) {
         if(res.status == "200"){
            $scope.isDone = true;
             console.log(res.statusText);
             pubsubService.publishUnverifiedMember(res.data.member);
             
         }
          
       });
    }
  }
};
MetronicApp.controller('HomeController',['$state','$rootScope','user','pubsubService',function($state,$rootScope,user,pubsubService){
     user.getMemberTypes().then(function(es){
     if(es.data.code == 200){
       es.data.memberTypes.forEach(function(ls,i){
         pubsubService.addMemberType(ls);
       });
       // member type loaded
       user.getMembers().then(function(es){
         if(es.data.code == 200){
            var status =  (es.data.server_status == 0)? false : true;
            pubsubService.addServerStatus(status);
           es.data.members.forEach(function(ls,i){
             pubsubService.addMember(ls);
           });
           pubsubService.addUser(es.data.user);
          // member and user are loaded
            user.getUnverifiedMember().then(function(res){

             if(res.data.members.length > 0){
              res.data.members.forEach(function(ls,i){
                pubsubService.addUnverifiedMember(ls);
              });
             }
             // unverified members are loaded
             user.getBranch().then(function(es){
               if(es.data.code == 200){
                 es.data.branches.forEach(function(ls,i){
                   pubsubService.addBranch(ls);
                 });
                 // branches are loaded
                 
                     user.getProducts().then(function(es){
                       if(es.data.code == 200){
                        
                         es.data.products.forEach(function(ls,i){
                           pubsubService.addProduct(ls);
                         });
                         // produnct type are loaded
                         user.getNotices().then(function(es){
                              if(es.data.code = 200){
                                es.data.notices.forEach(function(ls,i){
                                  pubsubService.addNotice(ls);
                                });
                                // notices loaded
                                  $state.go('dashboard');
                                
                              }
                         })
                       }
                     });
                  
                
               }
             });
             
          });
         
         }
       });

     }
   });
  





//$state.go('dashboard');
}]);
MetronicApp.controller('dashboardController',['$scope','$state','user','$rootScope','pubsubService','HOME',"$interval","$modal",function($scope,$state,user,$rootScope,pubsubService,HOME,$interval,$modal){
$scope.currentPage = 0;
$scope.pageSize = 5;
 
  user.getStocks().then(function(res){
    $scope.numberOfPages = Math.ceil($scope.stocks.length/$scope.pageSize);
    if(pubsubService.getClientStocks().length == 0){
      res.data.clientStocks.forEach(function(ls,i){
        pubsubService.addClientStock(ls);
      });
    } 

    $scope.clientStocks = pubsubService.getClientStocks();
    if(pubsubService.getStocks().length == 0){
      res.data.stocks.forEach(function(ls,i){
        pubsubService.addStock(ls);
      });
    }
    $scope.stocks = pubsubService.getStocks();
    if(pubsubService.getLimitOrders().length == 0){
      res.data.limitOrders.forEach(function(ls,i){
        pubsubService.addLimitOrder(ls);
      });
    }
    $scope.limitOrders = pubsubService.getLimitOrders();
    if(pubsubService.getClientAccounts().length == 0){
      res.data.clientAccounts.forEach(function(ls,i){
        pubsubService.addClientAccount(ls);
      });

    }
  });
  $scope.unverifiedMembers = pubsubService.getUnverifiedMembers();
  $scope.user = pubsubService.getUser();
  //$scope.stocks = pubsubService.getStocks();
  $scope.add = false;
   $scope.isDone = false;
   $scope.branch = null;
   $scope.isShowRequest = false;
   $scope.tabs = [
      { title:'Dynamic Title 1', content:'Dynamic content 1' },
      { title:'Dynamic Title 2', content:'Dynamic content 2', disabled: true }
    ];

    $scope.alertMe = function() {
      setTimeout(function() {
        $window.alert('You\'ve selected the alert tab!');
      });
    };
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  }
  $scope.addBranch = function(updateStock){
    $scope.updateStock = updateStock;
    $scope.add = ($scope.add)?false : true ;
  }
  $scope.branches = pubsubService.getBranches() ;
  
  $scope.stocks = pubsubService.getStocks();
  $scope.products = pubsubService.getProducts();
  $scope.branchName = function(branchId){
      var name ;
      $scope.branches.forEach(function(el,i){
        if(el.id == branchId){
          name = el;
        }
      });
    return name;
  }
  $scope.branchLocation = function(branchId){
      var name ;
      $scope.branches.forEach(function(el,i){
        if(el.id == branchId){
          name = el.location;
        }
      });
    return name;
  }
  $scope.product = function(Id){
      var name ;
      $scope.products.forEach(function(el,i){
        if(el.id == Id){
          name = el;
        }
      });
    return name;
  }
  $scope.getMemberById = function(memberId){
    var name ;
    pubsubService.getMembers().forEach(function(el,i){
      if(el.id == memberId){
        name = el;
      }
      
    });
      return name;
  }
  $scope.getStock =  function(id){
    return pubsubService.getStockById(id);
  }
  $scope.save = function(){
      user.updateStock($scope).then(function(es){
        
        if(es.data.code == 200){
          // pubsubService.addStock(es.data.stock);
          // $scope.branch = es.data.stock.id;
          // $scope.isDone = true;
        }
      });
  }
  $scope.hideRequest = function(){
    $scope.isShowRequest = ($scope.isShowRequest == true)? false : true;
  }
  $scope.showRequest = function(request){
    if(request.length > 0){
      $scope.requests = request;
      $scope.isShowRequest = true;
    }
  }
  $scope.approve = function(requestId){
    user.approveRequest(requestId,1).then(function(rs){
      pubsubService.updateStock(rs.data.clientStock);
    });
  }
  $scope.reject = function(requestId){
    user.approveRequest(requestId,2).then(function(rs){
      pubsubService.updateStock(rs.data.clientStock);
    });
  }
  $scope.offlineClass =  [ 'btn'];
  $scope.onlineClass = [ 'btn', 'btn-success'];
  $scope.marketDepth =  [ 'btn'];
  $scope.marketWatch = [ 'btn', 'btn-success'];
  $scope.request = 1;
  $scope.changeRequest = function(request){
    if(request == '1'){
      $scope.request = 1;
      $scope.onlineClass = [ 'btn', 'btn-success'];
      $scope.offlineClass = [ 'btn']; 
    }
    else{
      $scope.request = 0;
      $scope.offlineClass = [ 'btn', 'btn-success'];
      $scope.onlineClass = [ 'btn'];
    }  
  };
  $scope.market = 0;
  $scope.changeMarket = function(request){
    if(request == '1'){
      $scope.market = 1;
      $scope.marketDepth = [ 'btn', 'btn-success'];
      $scope.marketWatch = [ 'btn']; 
    }
    else{
      $scope.market = 0;
      $scope.marketWatch = [ 'btn', 'btn-success'];
      $scope.marketDepth = [ 'btn'];
    }  
  };
  $scope.delivery_charge = 0;
 $scope.changeClientBranch = function(){
  debugger;
  if($scope.clientRequestStock > 0){
    $scope.delivery_charge = $scope.branchName($scope.getStock($scope.clientRequestStock).branchId).delivery_charge;
  }
  else{
     $scope.delivery_charge = 0;
  }
 
 }
 $scope.commision = $scope.margin = $scope.lot_size = 0;
 $scope.amount = 0;
 $scope.changeClientProduct = function(){
    if($scope.clientProduct > 0){
      $product = $scope.product($scope.clientProduct);
      $scope.commision = $product.commision;
      $scope.margin = $product.margin;
      $scope.lot_size = $product.lot_size;
    }
    else{
     $scope.commision = $scope.margin = $scope.lot_size = 0;
    }
 }
 $scope.order = {};
 $scope.order.price = 0;
 $scope.addMerketOrder = function(valid){
  if(valid){
    $modal.open({
         templateUrl: 'views/addMerketOrder.html',
         controller: 'addMerketOrderController',
         resolve: {
           order: function () { return $scope.order }
         }
       });
  }
    
 }
 $scope.limitBuy = function(valid){
  if(valid){
    $modal.open({
         templateUrl: 'views/limitBuyOrder.html',
         controller: 'addLimitBuyController',
         resolve: {
           order: function () { return $scope.limit }
         }
       });
  }
    
 }
 $scope.limitSell = function(valid){
  if(valid){
    $modal.open({
         templateUrl: 'views/limitSellOrder.html',
         controller: 'addLimitSellController',
         resolve: {
           order: function () { return $scope.limit }
         }
       });
  }
    
 }
 $scope.getClientStockStatus = function(status){
    if(status == 0){
      return "Waiting";
    }
    else if(status == 1){
      return "Acepted";
    }
    else if(status == 2){
      return "Holding";
    }
    else if(status == 3){
      return "Rejected";
    }
    else if(status == 4){
      return "Processed";
    }
    else if(status == 5){
      return "In Vault";
    }
    
    else if(status == 6){
      return "Delivered";
    }
    else{
      return "Error";
    }
 }
 $scope.getClientStockType = function(type){
    if(type == 1){
      return "Buy";
    }
    else if(type == 0){
      return "Sell";
    }
    else{
      return "Error";
    }
 }
 $scope.acceptOrder = function(orderId,status){
    user.acceptOrder(orderId,status).then(function(res){
      $modal.open({
           templateUrl: 'views/message.html',
           controller: 'messageController',
           resolve: {
             data: function () { 
              if(status == 1){
                res.message = "Well done! Order is accepted.";
              }
              else{
                res.message = "Well done! Order is rejected.";
              }
              
              return res }
           }
         });
    },function(res){
      debugger;
    });
 }
$scope.loadBranch = function(){
  debugger;
  $scope.branchesId = [];
  $scope.order.price = parseInt(4000);
  $scope.order.price += parseInt($scope.order.symbol* 100);
  $scope.stocks.forEach(function(ls,i){
    if(ls.productTypeId == $scope.order.symbol){
      
      if($scope.branchesId.indexOf(ls.branchId) < 1){
       $scope.branchesId.push(ls.branchId);
      }
    }
  });
}
$scope.limitBranch = function(){
  $scope.limitBranchesId = [];
  
  $scope.stocks.forEach(function(ls,i){
    if(ls.productTypeId == $scope.limit.symbol){
      
      if($scope.limitBranchesId.indexOf(ls.branchId) < 1){
       $scope.limitBranchesId.push(ls.branchId);

      }
    }
  });
}
$scope.getBranchById = function(id){
  return pubsubService.getBranchById(id);
}
$scope.settlement = function(clientStock){
  $modal.open({
       templateUrl: 'views/settlement.html',
       controller: 'settlementController',
       resolve: {
         data: function () { return clientStock; }
       }
     });
}
}]);

MetronicApp.controller('addMerketOrderController',['$scope','$modalInstance', 'order','pubsubService','user',function($scope,$modalInstance,order,pubsubService,user){
  $scope.order = order;
  $scope.branch = pubsubService.getBranchById(order.branch);
  $scope.product = pubsubService.getProductById(order.symbol);
  $scope.commission = order.lot * $scope.product.commision;
  $scope.margin = order.lot * $scope.product.margin;
  $scope.delivery_charge = ((order.lot * $scope.product.lot_size)/10) * $scope.branch.delivery_charge;
  $scope.remaining_cost =  (((order.lot * $scope.product.lot_size)/10) * order.price) - $scope.margin;
  $scope.holding_cost = $scope.product.holding_cost * order.lot;
  var d = new Date();
d.setDate(d.getDate()+7);
$scope.delivery_date =    d.getMonth() + "-" +d.getDate()+ "-" + d.getFullYear();
$scope.errorMessage = false;
$scope.successMessage = false;
  if(pubsubService.getUser().amount < (((order.lot * $scope.product.lot_size)/10) * order.price) ){
    $scope.message = "Sorry you don't have sufficient balance!.";
    $scope.errorMessage = true;
  }
$scope.submit = function(){
  user.addMarketOrder(order).then(function(res){
    $scope.message = "Your request is waiting for approvel."
    if(res.data.code == 422){
      $scope.message = res.data.message;
      $scope.errorMessage = true;
    }
    if(res.data.code == 200){
      pubsubService.getUser().amount -= res.data.clientStock.cost;
      pubsubService.getUser().pending += res.data.clientStock.cost;
    $scope.successMessage = true;
      //pubsubService.user
    }
    
  },function(res){});
}
}]);
MetronicApp.controller('addLimitBuyController',['$scope','$modalInstance', 'order','pubsubService','user',function($scope,$modalInstance,order,pubsubService,user){
  $scope.order = order;
  $scope.branch = pubsubService.getBranchById(order.branch);
  $scope.product = pubsubService.getProductById(order.symbol);
  $scope.commission = order.lot * $scope.product.commision;
  $scope.margin = order.lot * $scope.product.margin;
  $scope.delivery_charge = ((order.lot * $scope.product.lot_size)/10) * $scope.branch.delivery_charge;
  $scope.remaining_cost =  (((order.lot * $scope.product.lot_size)/10) * order.priceMax) - $scope.margin;
  $scope.holding_cost = $scope.product.holding_cost * order.lot;
  var d = new Date();
d.setDate(d.getDate()+7);
$scope.delivery_date =    d.getMonth() + "-" +d.getDate()+ "-" + d.getFullYear();
$scope.errorMessage = false;
$scope.successMessage = false;
  if(pubsubService.getUser().amount < (((order.lot * $scope.product.lot_size)/10) * order.price) ){
    $scope.message = "Sorry you don't have sufficient balance!.";
    $scope.errorMessage = true;
  }
$scope.submit = function(){
  user.addLimitBuyOrder(order).then(function(res){
    $scope.message = "Your Buy Limit Order is published."
    if(res.data.code == 422){
      $scope.message = res.data.message;
      $scope.errorMessage = true;
    }
    if(res.data.code == 200){
      pubsubService.addLimitOrder(res.data.limitOrder);
      // pubsubService.getUser().amount -= res.data.clientStock.cost;
      // pubsubService.getUser().pending += res.data.clientStock.cost;
    $scope.successMessage = true;
    debugger;
      //pubsubService.user
    }
    
  },function(res){});
}
}]);
MetronicApp.controller('addLimitSellController',['$scope','$modalInstance', 'order','pubsubService','user',function($scope,$modalInstance,order,pubsubService,user){
  $scope.order = order;
  $scope.branch = pubsubService.getBranchById(order.branch);
  $scope.product = pubsubService.getProductById(order.symbol);
  $scope.commission = order.lot * $scope.product.commision;
  $scope.margin = order.lot * $scope.product.margin;
  $scope.delivery_charge = ((order.lot * $scope.product.lot_size)/10) * $scope.branch.delivery_charge;
  $scope.remaining_cost =  (((order.lot * $scope.product.lot_size)/10) * order.price) - $scope.margin;
  $scope.holding_cost = $scope.product.holding_cost * order.lot;
  var d = new Date();
d.setDate(d.getDate()+7);
$scope.delivery_date =    d.getMonth() + "-" +d.getDate()+ "-" + d.getFullYear();
$scope.errorMessage = false;
$scope.successMessage = false;
  if(pubsubService.getUser().amount < (((order.lot * $scope.product.lot_size)/10) * order.price) ){
    $scope.message = "Sorry you don't have sufficient balance!.";
    $scope.errorMessage = true;
  }
$scope.submit = function(){
  user.addLimitSellOrder(order).then(function(res){
    $scope.message = "Your Sell Limit Order is published."
    if(res.data.code == 422){
      $scope.message = res.data.message;
      $scope.errorMessage = true;
    }
    if(res.data.code == 200){
      pubsubService.addLimitOrder(res.data.limitOrder);
      // pubsubService.getUser().amount -= res.data.clientStock.cost;
      // pubsubService.getUser().pending += res.data.clientStock.cost;
    $scope.successMessage = true;
    }
    
  },function(res){});
}
}]);
MetronicApp.controller('HeaderController', ['$scope','user','$modal','$rootScope','$state','pubsubService','HOME', function($scope,user,$modal,$rootScope,$state,pubsubService,HOME) {
    $scope.$on('$includeContentLoaded', function() {
          $scope.logout = function(){
            user.logout().then(function(res){
                
                if(res.data.code == 200){
                  delete $rootScope.logined;
                  delete localStorage.jwtToken;
                  window.location = HOME;
                }
            });
          }
    $scope.switchStatus = pubsubService.getServerStatus();
    $scope.changeSwitch = function(){
      $scope.switchStatus =  ($scope.switchStatus)? false : true;
      user.changeServerStatus($scope.switchStatus).then(function(res){
        
        var status = (res.data.server_status == 1)? true : false;
        pubsubService.addServerStatus(status);
      },function(res){
        debugger;
      });
    }
    $scope.unverifiedMembers = pubsubService.getUnverifiedMembers();    
    $rootScope.$on('addUnverifiedMember', function (event, data) {
      $scope.$apply(function(){
        $scope.unverifiedMembers = pubsubService.getUnverifiedMembers();
        });
    });
    $scope.notices = pubsubService.getNotices();
    $rootScope.$on('publishNotice', function(event,data){
      $scope.$apply(function(){
          $scope.notices = pubsubService.getNotices();
      });
    });
         $scope.user = pubsubService.getUser();
          $rootScope.removeMember = function(id){
                delete $rootScope.unverifiedMembers[id];
          }
          $scope.open = function (position) {
                $scope.member = $scope.unverifiedMembers[position];
              var modalInstance = $modal.open({
                templateUrl: 'views/verifyMember.html',
                controller:'VerifyMemberController',
                
                size: 'lg',
                resolve: {
                  member: function () {
                    return $scope.member;
                  }
                }
              });

              modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
              }, function () {
                console.log('Modal dismissed at: ' + new Date());
              });
            };
            $scope.editProfile = function(){
              $scope.member = pubsubService.getUser();
              var modalInstance = $modal.open({
                templateUrl: 'views/editProfile.html',
                controller:'EditProfileController',
                
                size: 'lg',
                resolve: {
                  member: function () {
                    return $scope.member;
                  }
                }
              });

              modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
              }, function () {
                console.log('Modal dismissed at: ' + new Date());
              });
            }
            $scope.changePassword = function(){
              $scope.member = pubsubService.getUser();
              var modalInstance = $modal.open({
                templateUrl: 'views/changePassword.html',
                controller:'ChangePasswordController',
                
                size: 'lg',
                resolve: {
                  member: function () {
                    return $scope.member;
                  }
                }
              });

              modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
              }, function () {
                console.log('Modal dismissed at: ' + new Date());
              });
            }
            $scope.openNotice = function (position) {
                  $scope.member = $scope.notices[position];
                var modalInstance = $modal.open({
                  templateUrl: 'views/showNotice.html',
                  controller:'VerifyMemberController',
                  
                  size: 'lg',
                  resolve: {
                    member: function () {
                      return $scope.member;
                    }
                  }
                });

                modalInstance.result.then(function (selectedItem) {
                  $scope.selected = selectedItem;
                }, function () {
                  console.log('Modal dismissed at: ' + new Date());
                });
              };
        Layout.initHeader(); // init header
    });
}]);
MetronicApp.controller('VerifyMemberController',['$scope','$modalInstance','member','user','$state','$rootScope','pubsubService','HOME','pubsubService',function($scope, $modalInstance,member,user,$state,$rootScope,pubsubService,HOME,pubsubService){
  
  $scope.member = member;
  $scope.agent = pubsubService.getMemberById($scope.member.agentId);
  $scope.memberTypes = pubsubService.getMemberTypes();
  $scope.mtype = 1;
  $scope.success = false;
  $scope.fail = false;
  $scope.cancel = function () {
     //window.location = HOME;
    $state.go('dashboard');
    $modalInstance.dismiss('cancel');
  };
  $scope.send = function(isValid){
      if($scope.success){
          $scope.cancel();
      }
        if(isValid){
                if($scope.passwordConform === $scope.password){                   
                    $scope.error = "";
                    $scope.warning = "";
                    user.verifyMember($scope.member.id,$scope.username,$scope.password,$scope.mtype).then(function(res){
                     if(res.data.code = 200){
                      debugger;
                     // pubsubService.addMember(res.data.member);
                      pubsubService.removeUnverifiedMember(res.data.member);
                        $scope.success = true;
                      }
                      else{
                        $scope.fail = true;
                        document.getElementById('message').innerHTML = "fail";
                      }
                      
                    },function(res){
                       $scope.fail = true;
                       $scope.serverError = res.data.message;
                    });
                }
                else{
                  $scope.warning = "Password doesn't match!";
                }
                  
        }
    else{
          if($scope.username == undefined){
            $scope.error = "Invalid Username!";
          }
          else{
            $scope.error = "";
          }
          if($scope.password == undefined){
               $scope.warning = "Invalid Password!";
          }
          else{
              if($scope.passwordConform === $scope.password){
                  $scope.warning = "";
              }
              else{
                $scope.warning = "Password doesn't match!";
              }
          }
      }
    }
}]);
MetronicApp.controller('EditProfileController',['$scope','$modalInstance','member','user','$state','$rootScope','pubsubService','HOME','pubsubService',function($scope, $modalInstance,member,user,$state,$rootScope,pubsubService,HOME,pubsubService){
  
  $scope.member = member;
  $scope.mtype = 1;
  $scope.success = false;
  $scope.fail = false;
  $scope.member.cNumber = parseInt($scope.member.cNumber);
  $scope.member.mNumber = parseInt($scope.member.mNumber);
  $scope.member.identity = parseInt($scope.member.identity);
  $scope.cancel = function () {
     //window.location = HOME;
    $state.go('dashboard');
    $modalInstance.dismiss('cancel');
  };
  $scope.update = function(valid){
    if(valid){
      user.editMember($scope.member).then(function(es){
        if(es.data.code == 200){
          $scope.edit = false;
          $scope.branch = es.data.member.fname;
          $scope.message = "Now your profile is updated!";
          $scope.isDone = true;
          $scope.name = null;
          $scope.submitted = false;
        }
      });
    }
    else{
      $scope.submitted = true;
    }
      
  }
}]);
MetronicApp.controller('ChangePasswordController',['$scope','$modalInstance','member','user','$state','$rootScope','pubsubService','HOME','pubsubService',function($scope, $modalInstance,member,user,$state,$rootScope,pubsubService,HOME,pubsubService){
  
  $scope.member = member;
  $scope.mtype = 1;
  $scope.success = false;
  $scope.fail = false;
  $scope.mismatch = false;
  $scope.member.cNumber = parseInt($scope.member.cNumber);
  $scope.member.mNumber = parseInt($scope.member.mNumber);
  $scope.member.identity = parseInt($scope.member.identity);
  $scope.cancel = function () {
     //window.location = HOME;
    $state.go('dashboard');
    $modalInstance.dismiss('cancel');
  };
  $scope.update = function(valid){
    $scope.mismatch = false;
    $scope.isError = false;
    if(valid){
      if($scope.password.new != $scope.password.repeat){
        $scope.submitted = true;
        $scope.mismatch  = true;
      }
      else{
        user.changePassword($scope.password).then(function(es){
          if(es.data.code == 200){
            $scope.edit = false;
            $scope.message = "Now your password is updated!";
            $scope.isDone = true;
            $scope.name = null;
            $scope.submitted = false;
          }
        },function(res){
          $scope.isError = true;
          $scope.message = "invalid old password!";
        });
      }
      
    }
    else{
      $scope.submitted = true;
    }
      
  }
}]);
/* Setup Layout Part - Quick Sidebar */
MetronicApp.controller('QuickSidebarController', ['$scope','user','$rootScope','pubsubService', function($scope,$user,$rootScope,pubsubService) {    
   
   $scope.members = pubsubService.getMembers();
    $scope.$on('$includeContentLoaded', function() {
        setTimeout(function(){
            QuickSidebar.init(); // init quick sidebar        
        }, 2000)
    });
}]);
/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope','$modal','$rootScope','pubsubService', function($scope,$modal,$rootScope,pubsubService) {
    $scope.user = pubsubService.getUser();
    $scope.members = pubsubService.getMembers();
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar(); 
        $scope.branch = function () {
             
             // $scope.member = $scope.unverifiedMembers[position];
            var modalInstance = $modal.open({
              templateUrl: 'views/branch.html',
              controller:'BranchController'
              
            });

            modalInstance.result.then(function (selectedItem) {
              
            }, function () {
              console.log('Modal dismissed at: ' + new Date());
            });
          };
        
        $scope.isAccountAdmin = function(user){
          
          if(user.mtype === 3){
            return true;
          }
          
            return false;
          
            
        }
         $scope.stock = function () {
             
             // $scope.member = $scope.unverifiedMembers[position];
            var modalInstance = $modal.open({
              templateUrl: 'views/stock.html',
              controller:'StockController'
            });

            modalInstance.result.then(function (selectedItem) {
              
            }, function () {
              console.log('Modal dismissed at: ' + new Date());
            });
          };
          $scope.product = function () {
              // $scope.member = $scope.unverifiedMembers[position];
             var modalInstance = $modal.open({
               templateUrl: 'views/product.html',
               controller:'ProductController'
             });

             modalInstance.result.then(function (selectedItem) {
               
             }, function () {
               console.log('Modal dismissed at: ' + new Date());
             });
           };
           $scope.member = function () {
             var modalInstance = $modal.open({
               templateUrl: 'views/member.html',
               controller:'MemberController'
             });

             modalInstance.result.then(function (selectedItem) {
               
             }, function () {
               console.log('Modal dismissed at: ' + new Date());
             });
           };
           $scope.account = function () {
              // $scope.member = $scope.unverifiedMembers[position];
             var modalInstance = $modal.open({
               templateUrl: 'views/account.html',
               controller:'AccountController'
             });

             modalInstance.result.then(function (selectedItem) {
               
             }, function () {
               console.log('Modal dismissed at: ' + new Date());
             });
           };
           $scope.clientStock = function () {
              // $scope.member = $scope.unverifiedMembers[position];
             var modalInstance = $modal.open({
               templateUrl: 'views/clientStock.html',
               controller:'ClientStockController'
             });

             modalInstance.result.then(function (selectedItem) {
               
             }, function () {
               console.log('Modal dismissed at: ' + new Date());
             });
           };
           $scope.wareHouse = function () {
              var modalInstance = $modal.open({
                //template:"<div>prem</div>"
                templateUrl: 'views/wareHouse.html',
                controller:'WareHouseController'
              });

              modalInstance.result.then(function (selectedItem) {
                
              }, function () {
                console.log('Modal dismissed at: ' + new Date());
              });
            };
            $scope.notice = function () {
               var modalInstance = $modal.open({
                 //template:"<div>prem</div>"
                 templateUrl: 'views/notice.html',
                 controller:'NoticeController'
               });

               modalInstance.result.then(function (selectedItem) {
                 
               }, function () {
                 console.log('Modal dismissed at: ' + new Date());
               });
             };
             $scope.orderHistory = function(id){
              var memberId = id;
              var modalInstance = $modal.open({
                templateUrl: 'views/orderHistory.html',
                controller:'orderHistoryController',
                size: 'sm',
                resolve: {
                  member: function () {
                    return pubsubService.getMemberById(id);
                  }
                }
              });

              modalInstance.result.then(function (selectedItem) {
                
              }, function () {
              });
             }
             $scope.clientAccount = function(id){
              var memberId = id;
              var modalInstance = $modal.open({
                templateUrl: 'views/clientAccount.html',
                controller:'clientAccountController',
                size: 'sm',
                resolve: {
                  member: function () {
                    return pubsubService.getMemberById(id);
                  }
                }
              });

              modalInstance.result.then(function (selectedItem) {
                
              }, function () {
              });
             }

      });

}]);
MetronicApp.controller('orderHistoryController',['$scope','$modalInstance','user','$rootScope','pubsubService','member',function($scope,$modalInstance,user,$rootScope,pubsubService,member){
  $scope.member = member;
  $scope.clientStocks =  pubsubService.getClientStocks();
  $scope.getClientStockStatus = function(status){
     if(status == 0){
       return "Waiting";
     }
     else if(status == 1){
       return "Acepted";
     }
     else if(status == 2){
       return "Holding";
     }
     else if(status == 3){
       return "Rejected";
     }
     else if(status == 4){
       return "Processed";
     }
     else if(status == 5){
       return "In Vault";
     }
     
     else if(status == 6){
       return "Delivered";
     }
     else{
       return "Error";
     }
  }
  $scope.getClientStockType = function(type){
     if(type == 1){
       return "Buy";
     }
     else if(type == 0){
       return "Sell";
     }
     else{
       return "Error";
     }
  }
  $scope.product = function(Id){
      var name ;
      pubsubService.getProducts().forEach(function(el,i){
        if(el.id == Id){
          name = el;
        }
      });
    return name;
  }
$scope.getStock =  function(id){
    return pubsubService.getStockById(id);
  }
}]);
MetronicApp.controller('clientAccountController',['$scope','$modalInstance','user','$rootScope','pubsubService','member',function($scope,$modalInstance,user,$rootScope,pubsubService,member){
  $scope.member = member;
  $scope.clientAccounts =  pubsubService.getClientAccounts();
  $scope.amount = 0;
  $scope.myDate = function(date){
    return new Date(date);
  }
  $scope.product = function(Id){
      var name ;
      pubsubService.getProducts().forEach(function(el,i){
        if(el.id == Id){
          name = el;
        }
      });
    return name;
  }
$scope.getStock =  function(id){
    return pubsubService.getStockById(id);
  }
  $scope.description = function(clientAccount){
    if(clientAccount.type == 1 && clientAccount.ticket == null){
      $scope.amount += parseInt(clientAccount.amount);
      return "Deposited";
    }
    else if(clientAccount.ticket != null){
      var clientStock = pubsubService.getClientStockByTicket(clientAccount.ticket);
      var stock = pubsubService.getStockById(clientStock.stockId);
      var product = pubsubService.getProductById(stock.productTypeId);
      if(clientAccount.type == 0){
        $scope.amount -= clientAccount.amount;
        return "Market order for " + product.name;
      }
      else{
        $scope.amount += clientAccount.amount;
        return "Refund  for " + product.name;
      }
    }
    else if(clientAccount.ticket != null && clientAccount.type == 0 ){
      return "";
    }
      debugger
  }
  $scope.balance = function(account){
    debugger;
    var amount =0 ;
    $scope.clientAccounts.forEach(function(ls,i){
      if(ls.id > account.id){
        
      }
      else if(ls.type == 1 ){
        amount += parseInt(ls.amount);
      }
      else{
        
        amount -= parseInt(ls.amount)
      }
    });
    return amount;
  }
}]);
MetronicApp.controller('BranchController',['$scope','$modalInstance','user','$rootScope','pubsubService',function($scope,$modalInstance,user,$rootScope,pubsubService){
  
  $scope.add = false;
   $scope.isDone = false;
   $scope.submitted = false;
   $scope.edit = false;
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  }
  $scope.addBranch = function(){
    $scope.add = ($scope.add)?false : true ;
  }
  $scope.branches = pubsubService.getBranches();
  $rootScope.$on('publishBranch',function(event,data){
      $scope.$apply(function(){
        $scope.branches = pubsubService.getBranches();
      });
  });
  $scope.save = function(valid){
    if(valid){
      user.addBranch($scope.branch).then(function(es){
        if(es.data.code == 200){
          pubsubService.publishBranch(es.data.branch);
          pubsubService.addBranch(es.data.branch);
          $scope.message = es.data.branch.name + " is added to branch.";
          $scope.add = false;
          delete $scope.branch;
          $scope.isDone = true;
        }
      });
    }
    else{
      $scope.submitted = true;
    }
      
  }
  $scope.showEdit = function(branch){
    $scope.branch = branch;
    $scope.edit = true;
  }
  $scope.update = function(valid){
    if(valid){
      user.editBranch($scope.branch).then(function(res){
        debugger
        if(res.data.code == 200){
          $scope.message = res.data.branch.name + " is edited!.";
          $scope.edit = false;
          $scope.isDone = true;
          delete $scope.branch
        }
      },function(res){});
    }
  }
}]);
MetronicApp.controller('StockController',['$scope','$modalInstance','user','$rootScope','pubsubService',function($scope,$modalInstance,user,$rootScope,pubsubService){
  user.getStocks().then(function(res){
    $scope.stockTypes = res.data.stockTypes;
    $scope.stocks = res.data.stocks;
  });
  $scope.getStockTypeById = function(id){
    var stockType;
    $scope.stockTypes.forEach(function(ls,i){
      if(id == ls.id){
        stockType = ls;
      }
    });
    return stockType;
  }

  $scope.add = false;
   $scope.isDone = false;
   $scope.branch = null;
   $scope.submitted = false;
   $scope.stockProduct = {};
   $scope.stockProduct.minQuantity = 0;
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  }
  $scope.addBranch = function(){
    $scope.add = ($scope.add)?false : true ;
  }

  $scope.branches = pubsubService.getBranches() ;
  $scope.products = pubsubService.getProducts();
  $scope.branchName = function(branchId){
      var name ;
    
      $scope.branches.forEach(function(el,i){
        if(el.id == branchId){
         
          name = el.name;
        }
        //console.log(el);
      });
    
    return name;
  }
  $scope.branchLocation = function(branchId){
      var name ;
      $scope.branches.forEach(function(el,i){
        if(el.id == branchId){
          name = el.location;
        }
      });
    return name;
  }
  $scope.product = function(Id){
      var name ;
      $scope.products.forEach(function(el,i){
        if(el.id == Id){
          name = el;
        }
      });
    return name;
  }
  $scope.save = function(isValid){
    if(isValid){
      user.addStock($scope.stockProduct).then(function(es){
        delete $scope.stockProduct;
        $scope.addBranch();
        if(es.data.code == 200){
          if(es.data.status == 'created'){
            
            $scope.stocks.push(es.data.stock);
            $scope.isDone = true;
            $scope.message = "One new stock is added!";
          }
          else{
            $scope.isDone = true;
            $scope.message = "Product is added to stock!"
            $scope.stocks.forEach(function(ls,i){
              if(ls.id == es.data.stock.id){
                $scope.stocks[i].quantity +=  es.data.stockProduct.quantity;
              }
            });
            
          }
          
        }
      });
    }
    else{
      $scope.submitted = true;
    }
      
  }
}]);
MetronicApp.controller('ProductController',['$scope','$modalInstance','user','$rootScope','pubsubService',function($scope,$modalInstance,user,$rootScope,pubsubService){
  $scope.submitted = false;
  $scope.add = false;
  $scope.edit = false;
   $scope.isDone = false;
   $scope.branch = null;
   $scope.stockProduct = {};
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  }
  $scope.addBranch = function(){
    $scope.add = ($scope.add)?false : true ;
  }
  $scope.products = pubsubService.getProducts() ;
  $rootScope.$on('addProductType', function (event, data) {
    $scope.$apply(function(){
      $scope.products = pubsubService.getProducts() ;
      });
  });
  $scope.save = function($valid){
    if($valid){
        user.addProduct($scope.stockProduct).then(function(es){
          if(es.data.code == 200){
            pubsubService.publishProduct(es.data.product);
            pubsubService.addProduct(es.data.product);
            $scope.branch = es.data.product.name;
            $scope.message ="Now " + es.data.product.name + " is added to Product Type!";
            
            $scope.isDone = true;
            $scope.name = null;
          }
      });
    }
    else{
      $scope.submitted = true;
      console.log("invalid form");
    }
      
  }
  $scope.showEdit =function(product){
    $scope.stockProduct = product;
    $scope.edit = true;
  }
  $scope.update = function($valid){
    
    if($valid){
        user.editProduct($scope.stockProduct).then(function(es){
          if(es.data.code == 200){
            // pubsubService.publishProduct(es.data.product);
            // pubsubService.addProduct(es.data.product);
            // $scope.branch = es.data.product.name;
            $scope.message = "Product Type is edited!";
            $scope.edit = false;
            $scope.isDone = true;

            $scope.name = null;
          }
      });
    }
    else{
      $scope.submitted = true;
      console.log("invalid form");
    }
      
  }
}]);
MetronicApp.controller('MemberController',['$scope','$modalInstance','user','$rootScope','pubsubService',function($scope,$modalInstance,user,$rootScope,pubsubService){
  
  $scope.add = false;
  $scope.edit = false;
   $scope.isDone = false;
   $scope.branch = null;
   $scope.submitted = false;
   $scope.branches = pubsubService.getBranches();
   $scope.member = {};
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  }
  $scope.addBranch = function(){
    $scope.add = ($scope.add)?false : true ;
  }
  $scope.products = pubsubService.getProducts() ;
  $scope.memberTypes = pubsubService.getMemberTypes();
  $scope.members = pubsubService.getMembers();
  debugger;
  $scope.unverifiedMembers = pubsubService.getUnverifiedMembers();
  
  $scope.save = function(valid){
    debugger;
    if(valid){
      user.addMember($scope.member).then(function(es){
        if(es.data.code == 200){
          delete $scope.member;
          $scope.addBranch();
          pubsubService.publishUnverifiedMember(es.data.member);
          pubsubService.addUnverifiedMember(es.data.member);
          $scope.branch = es.data.member.fname;
          $scope.message = "Now" + $scope.branch + " is added to Unverified member list!";
          $scope.isDone = true;
          $scope.name = null;
          $scope.submitted = false;
        }
      });
    }
    else{
      $scope.submitted = true;
    }
      
  }
  $scope.update = function(valid){
    if(valid){
      user.editMember($scope.member).then(function(es){
        if(es.data.code == 200){
          delete $scope.member;
          $scope.edit = false;
          // pubsubService.publishUnverifiedMember(es.data.member);
          // pubsubService.addUnverifiedMember(es.data.member);
          $scope.branch = es.data.member.fname;
          $scope.message = "Now " + $scope.branch + " is updated!";
          $scope.isDone = true;
          $scope.name = null;
          $scope.submitted = false;
        }
      });
    }
    else{
      $scope.submitted = true;
    }
      
  }
  $scope.suspend = function(memberId){
    user.suspendMember(memberId).then(function(res){
      $scope.message = "Now " + res.data.member.fname +" "+ res.data.member.mname + " " + res.data.member.lname +" is suspended!";
      $scope.members.forEach(function(ls,i){
        if(ls.id == memberId){
          $scope.members[i].status = res.data.member.status;
        }
      });
      $scope.isDone = true;
    });
  }
  $scope.release = function(memberId){
    user.releaseMember(memberId).then(function(res){
      $scope.message = "Now " + res.data.member.fname +" "+ res.data.member.mname + " " + res.data.member.lname +" is realesed!";
      $scope.members.forEach(function(ls,i){
        if(ls.id == memberId){
          $scope.members[i].status = res.data.member.status;
        }
      });
      $scope.isDone = true;
    });
  }
  $scope.delete = function(memberId){
    user.deleteMember(memberId).then(function(res){
      $scope.message = "Now " + res.data.member.fname +" "+ res.data.member.mname + " " + res.data.member.lname +" is deleted!";
      $scope.members.forEach(function(ls,i){
        if(ls.id == memberId){
          $scope.members.splice(i,1);
        }
      });
      $scope.isDone = true;
    });
  }
  
  $scope.showEdit = function(editMember){
    $scope.member = editMember;
    $scope.member.identity = parseInt($scope.member.identity);
    $scope.member.cNumber = parseInt($scope.member.cNumber);
    $scope.member.mNumber = parseInt($scope.member.mNumber);
    $scope.edit = true;
  }
  $scope.back = function(){
    $scope.edit = false;
    delete $scope.member;

  }

}]);
MetronicApp.controller('AccountController',['$scope','$modalInstance','user','$rootScope','pubsubService',function($scope,$modalInstance,user,$rootScope,pubsubService){
  $scope.add = false;
   $scope.isDone = false;
   $scope.branch = null;
   $scope.submitted = false;
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  }
  $scope.addBranch = function(memberId,code){
    $scope.client = code;
    $scope.memberId = memberId;
    $scope.add = ($scope.add)?false : true ;
  }
  $scope.products = pubsubService.getProducts() ;
  $scope.memberTypes = pubsubService.getMemberTypes();
  $scope.members = pubsubService.getMembers();
  $scope.user = pubsubService.getUser();
  
  $scope.save = function(valid){
    if(valid){
      user.addAccount($scope).then(function(es){
        if(es.data.code == 200){
          delete $scope.account;
          pubsubService.updateAccount(es.data.account);
          $scope.branch = $scope.client;
          $scope.isDone = true;
          $scope.name = null;
          $scope.add = false;
        }
      });
    }
    else{
      $scope.submitted = true;
    }
      
  }
}]);
MetronicApp.controller('ClientStockController',['$scope','$modalInstance','user','$rootScope','pubsubService',function($scope,$modalInstance,user,$rootScope,pubsubService){
   $scope.add = false;
   $scope.isDone = false;
   $scope.isError = false;
   $scope.branch = null;
   $scope.user = pubsubService.getUser();
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  }
  $scope.addBranch = function(clientStock,clientBranch,clientProduct){
    $scope.clientStock = clientStock;
    $scope.clientBranch = clientBranch;
    $scope.clientProduct = clientProduct;
    $scope.rate = 10;
    $scope.amount = 0;
    $scope.add= true;
  }

  $scope.branches = pubsubService.getBranches() ;
  $scope.stocks = pubsubService.getStocks();
  $scope.products = pubsubService.getProducts();
  $scope.branchName = function(branchId){
      var name ;
      $scope.branches.forEach(function(el,i){
        if(el.id == branchId){
          name = el;
        }
      });
    
    return name;
  }
  $scope.branchLocation = function(branchId){
      var name ;
      $scope.branches.forEach(function(el,i){
        if(el.id == branchId){
          name = el.location;
        }
      });
    return name;
  }
  $scope.product = function(Id){
      var name ;
      $scope.products.forEach(function(el,i){
        if(el.id == Id){
          name = el;
        }
      });
    return name;
  }
  $scope.save = function(){
      user.addClientStock($scope).then(function(es){
        if(es.data.code == 200){
          debugger
          pubsubService.addClientStock(es.data.clientStock);
          $scope.branch = es.data.clientStock.id;
          $scope.isDone = true;
        }
        if(es.data.code == 400){
          $scope.isError = true;
        }
      });
  }
}]);
MetronicApp.controller('WareHouseController',['$scope','$modalInstance','user','$rootScope','pubsubService',function($scope,$modalInstance,user,$rootScope,pubsubService){
  
  $scope.add = false;
   $scope.isDone = false;
   $scope.branch = null;
   $scope.isShowRequest = false;
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  }
  $scope.addBranch = function(updateStock){
    $scope.updateStock = updateStock;
    $scope.add = ($scope.add)?false : true ;
  }
  $scope.branches = pubsubService.getBranches() ;
  $scope.stocks = pubsubService.getStocks();
  $scope.products = pubsubService.getProducts();
  $scope.branchName = function(branchId){
      var name ;
      $scope.branches.forEach(function(el,i){
        if(el.id == branchId){
          name = el;
        }
      });
    return name;
  }
  $scope.branchLocation = function(branchId){
      var name ;
      $scope.branches.forEach(function(el,i){
        if(el.id == branchId){
          name = el.location;
        }
      });
    return name;
  }
  $scope.product = function(Id){
      var name ;
      $scope.products.forEach(function(el,i){
        if(el.id == Id){
          name = el;
        }
      });
    return name;
  }
  $scope.getMemberById = function(memberId){
    var name ;
    pubsubService.getMembers().forEach(function(el,i){
      if(el.id == memberId){
        name = el;
      }
      
    });
      return name;
  }
  $scope.getStock =  function(id){
    return pubsubService.getStockById(id);
  }
  $scope.save = function(){
      user.updateStock($scope).then(function(es){
        
        if(es.data.code == 200){
          // pubsubService.addStock(es.data.stock);
          // $scope.branch = es.data.stock.id;
          // $scope.isDone = true;
        }
      });
  }
  $scope.hideRequest = function(){
    $scope.isShowRequest = ($scope.isShowRequest == true)? false : true;
  }
  $scope.showRequest = function(request){
    if(request.length > 0){
      $scope.requests = request;
      $scope.isShowRequest = true;
    }
  }
  $scope.approve = function(requestId){
    user.approveRequest(requestId,1).then(function(rs){
      pubsubService.updateStock(rs.data.clientStock);
    });
  }
  $scope.reject = function(requestId){
    user.approveRequest(requestId,2).then(function(rs){
      pubsubService.updateStock(rs.data.clientStock);
    });
  }
}]);
MetronicApp.controller('NoticeController',['$scope','$modalInstance','user','$rootScope','pubsubService',function($scope,$modalInstance,user,$rootScope,pubsubService){
   $scope.isDone = false;
   $scope.memberTypes = pubsubService.getMemberTypes();
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  }
  $scope.save = function(){
      user.sendNotice($scope.notice).then(function(res){
        if(res.data.code == 200){
          debugger;
         pubsubService.broadcastNotice(res.data.notice);
          // pubsubService.publishUnverifiedMember(res.data.notice);
          pubsubService.addNotice(res.data.notice);
          $scope.isDone = true;
        }
      });
  }
}]);
MetronicApp.controller('messageController',['$scope','$modalInstance', 'data','pubsubService','user',function($scope,$modalInstance,data,pubsubService,user){
  $scope.successMessage = true;
  $scope.message = data.message;
}]);
MetronicApp.controller('settlementController',['$scope','$modalInstance', 'data','pubsubService','user',function($scope,$modalInstance,data,pubsubService,user){
  $scope.successMessage = false;
  $scope.errorMessage = false;
  $scope.user = pubsubService.getUser();
  $scope.data = data;
  $scope.transferToVault = function(){
    user.transferToVault(data).then(function(res){
        $scope.successMessage = true;
        pubsubService.getClientStockById(data.id).status = res.data.clientStock.status;
        pubsubService.getUser().amount -= res.data.account.amount;
        pubsubService.getUser().pending +=  res.data.account.amount;
        $scope.message = "Congrats!! Your Request has been proceeded..";

    },function(res){
      $scope.errorMessage = true;
      $scope.message = res.data.message;

    });
  }
  $scope.transferToDelivery = function(){
    debugger;
    user.transferToDelivery(data).then(function(res){
        $scope.successMessage = true;
        pubsubService.getUser().amount -= res.data.account.amount;
        pubsubService.getUser().pending +=  res.data.account.amount;
        pubsubService.getClientStockById(data.id).status = res.data.clientStock.status;
        $scope.message = "Congrats!! Your Request has been proceeded..";

    },function(res){
      $scope.errorMessage = true;
      $scope.message = res.data.message;

    });
  }
}]);
