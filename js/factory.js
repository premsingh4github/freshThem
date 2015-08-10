	MetronicApp.factory('pubsubService',['$rootScope','$websocket',pubsubService]);
	function pubsubService($rootScope,$websocket){
		var user;
		var branches= [];
		var stocks = [];
		var products = [];
        var memberTypes = [];
        var members = [];
        var unverifiedMembers = [];
		
		// var wsUri = "ws://localhost:9000";  
	 //    websocket = new WebSocket(wsUri); 
	 //    websocket.onclose   = function(ev){
	 //        console.log("onclose");
	 //    }; 
	 //    websocket.onerror   = function(ev){
	 //        console.log("onerror");
	 //    };
	 //    websocket.onopen = function(ev) {
	 //    }
	 //    websocket.onmessage = function(ev) {
	 //    	debugger;
	 //    	var msg = JSON.parse(ev.data); 
	 //    	var type = msg.type; 
	 //    	var data = msg.data; 
	 //    	var clientId = msg.clientId; 
	    	

	 //    	if(type == 'addMember') 
	 //    	{
	 //    		debugger;
	 //    		members.push(data);
	 //    		$rootScope.$broadcast('addMember',{
	 //    		    members: members
	 //    		});	
	 //    	}
	 //    	if(type == 'system')
	 //    	{
	    		
	 //    	}
	    	
	 //    };
		
		function getBranches(){
			return branches;
		}
		
		var addBranch = function(branch){
	        branches.push(branch);
	        $rootScope.$broadcast('addBranch',{
	            branches: branches
	        });
    	}
    	function removeBranch(branchName){
    		branches.forEach(function(el,i){
    			if(el.name == branchName){
    				branches.splice(i,1);
    			}
    			//console.log(el);
    		});
    	}
    	function getStocks(){
    		return stocks;
    	}
    	function addStock(stock){
    		stocks.push(stock);
    		$rootScope.$broadcast('addStock',{
    		    stocks: stocks
    		});
    	}
    	function getProducts(){
    		return products;
    	}
    	function addProduct(product){
    		products.push(product);
    		$rootScope.$broadcast('addProduct',{
    		    products: products
    		});
    	}
        function getMemberTypes(){
            return memberTypes;
        }
        function addMemberType(memberType){
            memberTypes.push(memberType);
            $rootScope.$broadcast('addMemberType',{
                memberTypes: memberTypes
            });
        }
        function getMembers(){
            return members;
        }
        function addMember(member){
        	// var msg = {        	
        	// clientId: 1,
        	// type: "addMember",
        	// data : member
        	// };
        	
        	// websocket.send(JSON.stringify(msg));
            members.push(member);
            $rootScope.$broadcast('addMember',{
                members: members
            });
        }
        function addUser(userId){
        	members.forEach(function(el,i){
    			if(el.id == userId){
    				user = el;
    			}
    			$rootScope.$broadcast('addUser',{
    			    user: user
    			});
    		});
        }
        function getUser(){
        	return user;
        }
        function getUnverifiedMembers(){
            return unverifiedMembers;
        }
        function addUnverifiedMember(member){
            unverifiedMembers.push(member);
            $rootScope.$broadcast('addUnverifiedMember',{
                unverifiedMembers: unverifiedMembers
            });
        }
        function removeUnverifiedMember(member){
            unverifiedMembers.forEach(function(ls,i){
                if(ls.id == member.id){
                    unverifiedMembers.splice(i,1);
                }
            });
        }
		return {
		    getBranches: getBranches,
		    addBranch : addBranch,
		    removeBranch: removeBranch,
		    getStocks :getStocks,
		    addStock : addStock,
		    getProducts: getProducts,
		    addProduct : addProduct,
            getMemberTypes : getMemberTypes,
            addMemberType: addMemberType,
            getMembers : getMembers,
            addMember : addMember,
            addUser : addUser,
            getUser : getUser,
            getUnverifiedMembers : getUnverifiedMembers,
            addUnverifiedMember : addUnverifiedMember,
            removeUnverifiedMember : removeUnverifiedMember
		    
		};
	}