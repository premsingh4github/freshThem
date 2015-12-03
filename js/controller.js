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
    alert(1);
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
MetronicApp.controller('dashboardController',['$scope','$state','user','$rootScope','pubsubService','HOME',"$interval",function($scope,$state,user,$rootScope,pubsubService,HOME,$interval){
  $scope.unverifiedMembers = pubsubService.getUnverifiedMembers();
  $scope.user = pubsubService.getUser();
  $scope.stocks = pubsubService.getStocks();
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
      debugger;
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
  $scope.request = 1;
  $scope.changeRequest = function(request){
    if(request == '1'){
      $scope.request = 1;
      //$scope.onlineClass = [ 'caption-subject', 'font-green-haze', 'bold', 'uppercase'];
      $scope.onlineClass = [ 'btn', 'btn-success'];
      $scope.offlineClass = [ 'btn']; 
    }
    else{
      $scope.request = 0;
      $scope.offlineClass = [ 'btn', 'btn-success'];
      $scope.onlineClass = [ 'btn'];
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
    $scope.switchStatus = true;
    
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
      debugger;
        if(isValid){
                if($scope.passwordConform === $scope.password){                   
                    $scope.error = "";
                    $scope.warning = "";
                    user.verifyMember($scope.member.id,$scope.username,$scope.password,$scope.mtype).then(function(res){
                     if(res.data.code = 200){
                      pubsubService.addMember(res.data.member);
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
              // $scope.member = $scope.unverifiedMembers[position];
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

      });

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
          $scope.message = es.data.branch.name + "is added to branch.";
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
          $scope.message = res.data.branch.name + " edited!.";
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
            $scope.message ="Now " + es.data.product.name + "is added to Product Type!";
            
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
   $scope.isDone = false;
   $scope.branch = null;
   $scope.submitted = false;
   $scope.branches = pubsubService.getBranches();
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  }
  $scope.addBranch = function(){
    $scope.add = ($scope.add)?false : true ;
  }
  $scope.products = pubsubService.getProducts() ;
  $scope.memberTypes = pubsubService.getMemberTypes();
  $scope.members = pubsubService.getMembers();
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
  console.log($scope.members);
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
      debugger;
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