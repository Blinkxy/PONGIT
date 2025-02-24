import { getWebsocket, closeWebsocket , dataPlayer}  from "/components/matchMaking.js"
class Player {
    constructor( x, y, width, height , pos, color ) {
        this.x       =  Number(x);
        this.y       =  Number(y);
        this.targetY =  Number(y);
        this.width   =  Number(width);
        this.height  =  Number(height);
        this.color   =  color
        this.speed   =  0;
        this.score   =  0;
        
        this.position=  pos; 
    }

    updatePosition() {
        const   smoothFactor = 0.1; // Adjust this value for smoothness (lower = smoother but slower)
        const   epsilon      = 0.0001
        if ( Math.abs(this.targetY - this.y) > epsilon ) {
            this.y += (this.targetY - this.y) * smoothFactor;
        }
        // console.log("here" , this.y)
    }
}

class Ball {
    constructor( x, y ,width, height, speed) {
        this.x      =   Number(x);
        this.y      =   Number(y);
        this.width  =   Number(width);
        this.height =   Number(height);
        this.speedX =   Number(speed);
        this.speedY =   Number(speed);
        this.targetY=   Number(this.y);
        this.targetX=   Number(this.x);
        this.reset  =   "none"
    }
    updatePosition() {
        const smoothFactor = 0.3; // Adjust this value for smoothness (lower = smoother but slower)
        this.y += (this.targetY - this.y) * smoothFactor;
        this.x += (this.targetX - this.x) * smoothFactor;
    }
}

export class Manger{
    canvaWidth;
    canvaHeight;
    constructor( data/*width, height*/, name ) {
        this.canvaWidth     =   Number(data["data"].canvas_w);
        this.running        =   true;
        this.canvaHeight    =   Number(data["data"].canvas_h);
        // console.log(typeof(this.canvaHeight))
        this.player_h       =   Number(data["data"].player_h);
        this.player_w       =   Number(data["data"].player_w);
        // console.log(this.canvaWidth)
        // console.log(this.canvaHeight)
        // console.log(this.player_w)
            // left Player
        this.left           =   new Player( data["left"]["coordinates_x"], 
                                    data["left"]["coordinates_y"],
                                        this.player_w, this.player_h, "left", data["left"]["color"] )
            // right player
        this.right          =   new Player( data["right"]["coordinates_x"], 
                                    data["right"]["coordinates_y"],
                                        this.player_w, this.player_h, "right", data["right"]["color"] )

        this.ball           =   new Ball( data["data"].ball_x,  data["data"].ball_y, data["data"].ball_w, data["data"].ball_h, data["data"].ball_speed );

        this.doc            =   document.querySelector(name);
        this.cxt            =   this.doc.getContext("2d")
        this.loop = this.loop.bind(this);
        this.requestFrameId = null;
        this.draw()
        this.typeGame = "remote"
    }

	// Function to draw a rounded rectangle
	// Function to draw a slightly rounded rectangle
	drawRoundedRect(context, x, y, width, height, radius, fillColor) {
		context.beginPath();
		context.moveTo(x + radius, y); // Start at the top-left corner (with radius)
		context.lineTo(x + width - radius, y); // Top side
		context.quadraticCurveTo(x + width, y, x + width, y + radius); // Top-right corner
		context.lineTo(x + width, y + height - radius); // Right side
		context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height); // Bottom-right corner
		context.lineTo(x + radius, y + height); // Bottom side
		context.quadraticCurveTo(x, y + height, x, y + height - radius); // Bottom-left corner
		context.lineTo(x, y + radius); // Left side
		context.quadraticCurveTo(x, y, x + radius, y); // Top-left corner
		context.closePath();

		context.fillStyle = fillColor; // Set the fill color
		context.fill(); // Fill the rectangle
	}


    draw( ) {
		// Example usage with subtle rounding
        // console.log("test test test test test test")
		const borderRadius = 5; // Set radius for subtle rounding (smaller value)

        this.cxt.clearRect(0 , 0, this.canvaWidth, this.canvaHeight); 
        this.cxt.fillStyle = this.left.color;
        // console.log("is here all paddle")
        // this.cxt.fillRect(this.left.x, this.left.y, this.left.width, this.left.height);

		this.drawRoundedRect(this.cxt, this.left.x, this.left.y, this.left.width, this.left.height, borderRadius, this.left.color);
        // console.log( this.ball.x , this.ball.y )
        
        this.cxt.fillStyle = this.right.color;
        // this.cxt.fillRect(this.right.x, this.right.y, this.right.width, this.right.height);
		this.drawRoundedRect(this.cxt, this.right.x, this.right.y, this.right.width, this.right.height, borderRadius, this.right.color);


        this.cxt.fillStyle = "red";
        this.cxt.fillRect( this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.cxt.fillStyle = "red";
        this.cxt.font = "45px sans-serif";
    }
    loop () {
        if ( this.running === false ) return;
        if ( this.left.targetY >= 0 )
            this.left.updatePosition()
        if ( this.right.targetY >= 0 )
            this.right.updatePosition()
        // this.right.updatePosition()
        // if ( this.ball.reset === "none")
        if ( this.typeGame === "locale") {
            this.moveBall()
            // this.manager.left.score              =   data["left"]
            //         this.manager.right.score             =   data["right"]
            document.querySelector(".container .allElementLocale .leftPlayer p").innerHTML = this.left.score
            document.querySelector(".container .allElementLocale .rightPlayer p").innerHTML = this.right.score
            if ( this.left.score == 7 || this.right.score == 7 ) {
                document.querySelector(".container game-component-locale").remove()
            }

        }
        else 
            this.ball.updatePosition()
        this.draw();
        // console.log("hello in loop function")
        this.requestFrameId =  requestAnimationFrame(this.loop);
        // console.log(this.requestFrameId)
    }
    start(){
        this.running = true
        this.loop()
    }
    stop() {
        this.running = false
        cancelAnimationFrame( this.requestFrameId )
    }
    moveBall( ) {
        this.ball.x += this.ball.speedX
        this.ball.y += this.ball.speedY

        // console.log(this.ball.x , this.ball.y , this.ball.speedX)

        if ( this.ball.y < 0 || this.ball.y > this.canvaHeight ) 
            this.ball.speedY *= -1
        
        if ( this.detectCollision( this.ball, this.left ) ) {
            if ( this.ball.x <= this.left.x + this.left.width )
                this.ball.speedX *= -1
        }
        else if ( this.detectCollision( this.ball, this.right ) ) {
            // console.log( this.ball.x , )
            if ( this.ball.x + this.ball.width >= this.right.x ) 
                this.ball.speedX *= -1
        }

        if ( this.ball.x + this.ball.width <= 0 ) {
            this.right.score += 1;
            this.ball.x =   ( this.canvaWidth / 2 ) - ( this.ball.width / 2 )
            this.ball.y =   ( this.canvaHeight / 2 ) - ( this.ball.height / 2 )
        }
        else if ( this.ball.x >= this.canvaWidth ) {
            this.left.score += 1;
            this.ball.x =   ( this.canvaWidth / 2 ) - ( this.ball.width / 2 )
            this.ball.y =   ( this.canvaHeight / 2 ) - ( this.ball.height / 2 )
        }
    }
    detectCollision( ball , player ) {
        // console.log( ball.x , ball.y )
        return  ball.x < player.x + player.width &&
                ball.x + ball.width > player.x &&
                ball.y < player.y + player.height &&
                ball.y + ball.height > player.y;
    }
    // def detectCollision( ball:list , player:list ) -> bool:
    // return ( ball[0] <= player[0] + settings.PLAYER_WIDTH
    //         and ball[0] + settings.BALL_WIDTH >= player[0] 
    //         and ball[1] <= player[1] + settings.PLAYER_HEIGHT 
    //         and ball[1] + settings.BALL_HEIGHT >= player[1] )
}
