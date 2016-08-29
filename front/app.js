var app = angular.module('MyApp',[])
	
	//providng with the header authorization function
	.config(['$httpProvider', function($httpProvider){
		$httpProvider.interceptors.push('AuthInterceptor');
	}]);

	//constant
	app.constant('API_URL', 'http://localhost:3000');

	//controller
	app.controller('MainCtrl', ['$scope','RandomUserFactory', 'UserFactory', function($scope, RandomUserFactory, UserFactory){
		// console.log('MainCtrl running');
		//Initialization
		UserFactory.getUser().then(function sucess(response){
			console.log('get',response.data);
			$scope.user = response.data;
		});

		$scope.getRandomUser = function(){
			console.log('RandomUserCode runned');
			RandomUserFactory.getUser().then(function(res){
					$scope.randomUser = res.data;
			});			
		};

		$scope.login = function(username, password){
			UserFactory.login(username, password).then(function success(response){
				$scope.user = response.data.user;
			}, handleError);

			function handleError(response){
				alert('Error:' + response.data);
			}
		};

		$scope.logout = function(){
			UserFactory.logout();
			$scope.user = null;
		}
	}]);

	//factories
	app.factory('RandomUserFactory', function($http, API_URL){
		return {
			getUser: getUser
		};

		function getUser(){
			return $http.get(API_URL+'/random-user');
		}
	});

	app.factory('UserFactory', function($http, API_URL, AuthTokenFactory, $q){
		return {
			login: login,
			logout: logout,
			getUser: getUser
		};

		function login(username, password){
			return $http.post(API_URL+'/login',{
				username: username,
				password: password
			}).then(function sucess(response){
				AuthTokenFactory.setToken(response.data.token);
				return response;
			});
		}

		function logout(){
			AuthTokenFactory.setToken();
		}

		function getUser(){
			if(AuthTokenFactory.getToken()){
				return $http.get(API_URL+ '/me');
			}else{
				return $q.reject({data:'client has no auth token'});
			}
		}
	});

	app.factory('AuthTokenFactory', function($window){
		var store = $window.localStorage;
		var key = 'auth-token';
		return {
			getToken: getToken,
			setToken: setToken
		};

		function getToken(){
			return store.getItem(key);
		}

		function setToken(token){
			if(token){
				store.setItem(key,token);
			}else{
				store.removeItem(key);
			}
		}
	});

	app.factory('AuthInterceptor', function(AuthTokenFactory){
		return {
			request: addToken
		};

		function addToken(config){
			var token = AuthTokenFactory.getToken();
			if(token){
				console.log('from authinterceptor',token);
				config.headers = config.headers || {};
				config.headers.Authorization = 'Bearer ' + token;
			}
			return config;
		}


	});