	MetronicApp.factory('pubsubService',['$rootScope','$websocket',pubsubService]);
	function pubsubService($rootScope,$websocket){
		var user;
		var branches= [];
		var stocks = [];
		var products = [];
        var memberTypes = [];
        var members = [];
        var unverifiedMembers = [];
        var clientStocks = [];
		
		var wsUri = "ws://localhost:9000";  
	    websocket = new WebSocket(wsUri); 
	    websocket.onclose   = function(ev){
	        console.log("onclose");
	    }; 
	    websocket.onerror   = function(ev){
	        console.log("onerror");
	    };
	    websocket.onopen = function(ev) {
            console.log('socket open');
	    }
	    websocket.onmessage = function(ev) {
	    	debugger;
	    	var msg = JSON.parse(ev.data); 
            console.log(msg);
	    	if(msg.type == 'addMember') 
	    	{
	    		debugger;
                console.log(members,"before");
	    		members.push(msg.data);
	    		$rootScope.$broadcast('addMember',{
	    		    members: members
	    		});	
                unverifiedMembers.forEach(function(ls,i){
                    if(ls.id == msg.data.id){
                        unverifiedMembers.splice(i,1);
                        addMember(ls);                       
                    }
                });
                console.log(members,"after");
	    	}
            debugger;
	        if(msg.type == 'addUnverifiedMember')
	    	{
                debugger;
	    		addUnverifiedMember(msg.data);
	    	}
            // else{
            //     console.log(msg.type);
            // }
	    	
	    };
		
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
                    addMember(ls);
                    var msg = {          
                    clientId: 1,
                    type: "addMember",
                    data : ls
                    };
                    
                    websocket.send(JSON.stringify(msg));
                }
            });
        }
        function updateAccount(account){
                members.forEach(function(el,i){
                    if(el.id == account.memberId){
                        branches.splice(i,1);
                        if(account.type == 1){
                            members[i].amount =  +members[i].amount + +account.amount;
                        }
                        else{
                            members[i].amount =  +members[i].amount - +account.amount;
                        }
                    }
                    //console.log(el);
                });
        }
        function getClientStocks(){
            return clientStocks;
        };
        function addClientStock(clientStock){
            clientStocks.push(clientStock);
            $rootScope.$broadcast('addClientStock',{
                clientStocks: clientStocks
            });
        };
        function publishUnverifiedMember(member){
            debugger;
            var msg = {
            type: "addUnverifiedMember",
            data : member
            };
            
            websocket.send(JSON.stringify(msg));
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
            removeUnverifiedMember : removeUnverifiedMember,
            updateAccount: updateAccount,
            getClientStocks : getClientStocks,
            addClientStock : addClientStock,
            publishUnverifiedMember : publishUnverifiedMember
		    
		};
	}