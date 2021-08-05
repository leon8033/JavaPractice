function Tetris(setting){
			//初始創建遊戲給的設定值
			this.setting =setting;
		}

Tetris.prototype={

		blocks:[
			 [[1, 1, 1, 1]],
  			 [[1, 1], [1, 1]],
  			 [[1, 1, 0], [0, 1, 1]],
  			 [[0, 1, 1], [1, 1, 0]],
  			 [[1, 0, 0], [1, 1, 1]],
  			 [[0, 0, 1], [1, 1, 1]],
  			 [[0, 1, 0], [1, 1, 1]]
		],
		
		 initCanvas:function(){
			//創建canvas
			var canvas = document.createElement('canvas');
			var setting = this.setting;
			this.ctx=canvas.getContext('2d');
			//設置大小及添加canvas
			canvas.width=setting.row*(setting.grid + setting.margin)-setting.margin; 
			canvas.height=setting.col*(setting.grid + setting.margin)-setting.margin;
			canvas.style='background: black;position: absolute; top: 0;left: 0;right: 0;bottom: 0;margin:auto';
			var body=document.getElementsByTagName('body')[0];
			body.appendChild(canvas);
		},
		 init:function(){
			this.initCanvas();
			this.x=this.setting.offsetX;
			this.y=0;
			this.map=[];
			this.curBlock=[];
			this.onkeydownFlag=false;
			this.timer=null;
			this.supplyRow = this.getSupplyRow();
		},
		//遊戲開始
		 start:function(){
			this.init()
			this.createMap()
			this.createBlock()
			this.updateMap()
			this.enableKeyControl()
			this.fall(this.setting.interval)
		},
		//建造格子地圖
		 createMap:function(){
			var setting =this.setting;
			//列
			for(var i=0;i<setting.row;i++){
				this.map.push([]);
				//行
				for(var j=0;j<setting.col;j++){
					this.map[i].push(0);
				};
			};
		},
		//地圖添加顏色及格子樣式
		 render:function (){
			var map = this.map;
			var mRowLen = map.length;
			var mColLen = map[0].length;
			var margin =this.setting.margin;
			var grid = this.setting.grid;
			for(var i=0;i<mRowLen;i++){
				for(var j=0;j<mColLen;j++){
					if(map[i][j]==1){
						this.ctx.fillStyle='red';
					}else{
						this.ctx.fillStyle='white';
					}
					//fillRect(x,y,width,height)
					this.ctx.fillRect(j*(grid+margin),i*(grid+margin),grid,grid);
				}
				
			}
		},
		//隨機數
		 random:function(min,max){
			return min+Math.floor(Math.random()*(max-min));
		},
		//創建方塊
		createBlock:function(){
			this.curBlock = this.blocks[this.random(0,this.blocks.length)];
			this.x=this.setting.offsetX;
		},
		//地圖更新 
		updateMap:function(){
			var curBlock = this.curBlock;
			var blockRowLen = curBlock.length;
			var blockColLen = curBlock[0].length;
			for (var i=0;i<blockRowLen;i++){
				for (var j=0;j<blockColLen;j++){
					//map[i][j]為0，則為false，也表示沒有方塊
					if(!this.map[i+this.y][j+this.x]){
						this.map[i+this.y][j+this.x]=curBlock[i][j];
					}
				}
			}
			//再次上色
			this.render();
		},
		//遊戲結束判定
		gameOver:function(){
			for(var j=0;j<this.map[0].length;j++){
				//最上層那排數組中有方塊，則為遊戲結束
				if(this.map[0][j]){
					return true;
				}
				return false;
			}
		},
		//方塊下落
		fall:function(interval){
			var _t=this;
			this.timer=setInterval(function(){
				//判斷是否落地
				if(_t.groundTest(_t.curBlock)){
					//是否遊戲結束
					if(_t.gameOver()){
						alert('遊戲結束');
						clearInterval(_t.timer);
						return _t.start();
					}
					_t.removeBlock();
					_t.y=-1;
					_t.createBlock();
				}
				if(~_t.y){
					_t.clearBlock();
				}
					_t.y++;
					_t.updateMap();
				
			},interval);
		},
		//轉換方塊方向
		enableKeyControl:function(){
			var _t =this;
			document.onkeydown=function(e){
				switch(e.keyCode){
					case 37://向左
						if(!_t.borderTest(_t.curBlock,-1)){
							//先清除該方塊的map的位置後，更改座標，再次更新在地圖上
							_t.clearBlock();
							_t.x--;
							_t.updateMap();
						}
						break;
					case 39://向右
						if(!_t.borderTest(_t.curBlock,1)){
							_t.clearBlock();
							_t.x++;
							_t.updateMap();
						}
						break;
					case 38://向上即變形
						_t.clearBlock();
						_t.transform();
						_t.updateMap();
						break;
					case 40:
						if(!_t.onkeydownFlag){
							_t.onkeydownFlag =true;
							clearInterval(_t.timer);
							_t.fall(_t.setting.fasterInterval);
							
						}
						break;
				}
			}
			document.onkeyup = function(e){
				if(e.keyCode==40){
					_t.onkeydownFlag=false;
					clearInterval(_t.timer);
					_t.fall(_t.setting.interval);
				};
			};
		},
		//方塊左右方轉是否碰撞
		borderTest:function(curBlock,direction,isTransform){
			var map=this.map;
			var blockRowLen=curBlock.length;
			var blockColLen=curBlock[0].length;
			var n;
			var blockBorder;
			var mapBorder;
			if(direction===-1){
				blockBorder=0;
				mapBorder=this.x-1;
				if(this.x <=0 && !isTransform){
					return true;
				};
				}else{
					blockBorder = blockColLen-1;
					mapBorder=this.x+blockColLen;
					if(this.x + blockColLen>=this.setting.col){
						return true;
					};
				}
				for(var i=0;i<blockRowLen;i++){
					//取的方塊每行最後一格方塊位置
					if(curBlock[i][blockBorder]){
						if(map[i+this.y][mapBorder]){
							return true;
						};
						}else{
							n=blockBorder;
							while(curBlock[i][n]){
								direction ===-1?n++:n--;
							}
							if(map[i+this.y][n+this.x+direction===-1?-1:1]){
								return true;
							}
						}
					}
				return false;
		},
		// 方塊向下是否碰撞
		groundTest:function(curBlock){
			var map =this.map;
			var blockRowLen=curBlock.length;
			var blockColLen=curBlock[0].length;
			var n;
			//第一種情況 碰到最底層
			if(this.y+curBlock.length >= this.map.length){
				return true;
			};
			//第二種情況，碰撞到其他方塊
			
			//先取得方塊的長度
			for(var j=0;j < blockColLen;j++){
			//判斷方塊最下面那層
				if(curBlock[blockRowLen-1][j]){
					if(map[blockRowLen+this.y][j+this.x]){
						return true;
					}
					}else{
						n=blockRowLen-1; //0
						while(!curBlock[n][j]){//01 02 03 04
							n--;
						}
						if (map[n + this.y+1][j+this.x]){
							return true;
						}
					}
			return false;	
			};
		},
			//方塊翻轉
			transform:function(){
				//翻轉後的方塊數組
				var result=[];
				var curBlock = this.curBlock;
				var blockRowLen = curBlock.length;
				var blockColLen = curBlock[0].length;
				for(var i=0;i<blockColLen;i++){
					result.push([]);
					for(var j=0;j<blockRowLen;j++){
						result[i][blockRowLen-j-1]=curBlock[j][i]
					};
				};
				if( 
					!this.groundTest(result)&&
					!this.borderTest(result,-1,true)&&
					!this.borderTest(result,1,true)
				){
					this.curBlock = result;
				};
			},
			//方塊清除
			clearBlock:function(){
				var curBlock = this.curBlock;
				var blockRowLen = curBlock.length;
				var blockColLen = curBlock[0].length;
				for(var i=0;i<blockRowLen;i++){
					for(var j=0;j<blockColLen;j++){
						//curBlock[i][0~blockColLen]皆為1，則消除
						if(curBlock[i][j]){
							this.map[i+this.y][j+this.x]=0;
						};
						};
				};
			},
			//將方塊消除
			removeBlock:function(){
				var map=this.map;
				var mRowLen=map.length;
				var mColLen=map[0].length;
				var fullFlag=true;
				for(var i=0;i<mRowLen;i++){
					fullFlag=true;
					for(var j=0;j<mColLen;j++){
						if(!map[i][j]){
							fullFlag=false;
						};
					};
					if(fullFlag){
						//透過splice刪除行
						this.map.splice(i,1);
						//透過slice選取，unshift添加
						this.map.unshift(this.supplyRow.slice());
					};
				};
			},
			//補充行數
			getSupplyRow: function() {
				var arr=[];
				for(var i=0;i<this.setting.col;i++){
					arr.push(0)
				}
				return arr;
			}
};
			
			
			
			
