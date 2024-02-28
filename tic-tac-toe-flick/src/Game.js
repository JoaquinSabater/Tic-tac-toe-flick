import React from 'react';
import PengineClient from './PengineClient';
import Board from './Board';


/**
 * List of colors.
 */

 const colors = ["r", "v", "p", "g", "b", "y"];  // red, violet, pink, green, blue, yellow

 let recordColor = [];
 
 let coordinatesSetted = false;
 
 let corX = null;
 
 let corY = null;

 let helpList = [];
 
 export function setCordenadas(x,y){
  if(!coordinatesSetted){
    corX = x;
    corY = y;
  }
  coordinatesSetted = true;
}
 

/**
 * Returns the CSS representation of the received color.
 */

 export function colorToCss(color) {
  switch (color) {
    case "r": return "#CC0000";
    case "v": return "#590010";
    case "p": return "#781078";
    case "g": return "#006600";
    case "b": return "#0000CC";
    case "y": return "#999900";
    default:;
  }
  return color;
}
class Game extends React.Component {

  pengine;

  constructor(props) {
    super(props);
    this.state = {
      turns: 0,
      grid: null,
      complete: false,  // true if game is complete, false otherwise
      waiting: false,
      capturedCells:0,
      show: false,
      helpNumber:0,
      colorInOriginalCell: null,
      capturedHelp:0,
      colorControl: false,
      helpResult:null
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handlePengineCreate = this.handlePengineCreate.bind(this);
    this.pengine = new PengineClient(this.handlePengineCreate);
    this.helpPluginGreedy = this.helpPluginGreedy.bind(this);
    this.helpPlugin = this.helpPlugin.bind(this);
  }

  handlePengineCreate() {
    const queryS = 'init(Grid)';
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        this.setState({
          grid: response['Grid']
        });
      }
    });
  }

  handleClick(color) {
    
    // No action on click if game is complete or we are waiting.
    if (this.state.complete || this.state.waiting) {
      return;
    }
    // Build Prolog query to apply the color flick.
    // The query will be like:
    // flick([[g,g,b,g,v,y,p,v,b,p,v,p,v,r],
    //        [r,r,p,p,g,v,v,r,r,b,g,v,p,r],
    //        [b,v,g,y,b,g,r,g,p,g,p,r,y,y],
    //        [r,p,y,y,y,p,y,g,r,g,y,v,y,p],
    //        [y,p,y,v,y,g,g,v,r,b,v,y,r,g],
    //        [r,b,v,g,b,r,y,p,b,p,y,r,y,y],
    //        [p,g,v,y,y,r,b,r,v,r,v,y,p,y],
    //        [b,y,v,g,r,v,r,g,b,y,b,y,p,g],
    //        [r,b,b,v,g,v,p,y,r,v,r,y,p,g],
    //        [v,b,g,v,v,r,g,y,b,b,b,b,r,y],
    //        [v,v,b,r,p,b,g,g,p,p,b,y,v,p],
    //        [r,p,g,y,v,y,r,b,v,r,b,y,r,v],
    //        [r,b,b,v,p,y,p,r,b,g,p,y,b,r],
    //        [v,g,p,b,v,v,g,g,g,b,v,g,g,g]],r, Grid)
    const gridS = JSON.stringify(this.state.grid).replaceAll('"', "");
    if(corX== null && corY==null){
      corX = 0;
      corY = 0;
    }
    
    const queryS = "flick(" + gridS+"," + corX + "," + corY +"," + color + ", Visited, Grid )";
    this.setState({
      waiting: true
    });
    console.log(this.state.grid);
    
    if (this.state.complete === false){
      this.pengine.query(queryS, (success, response) => {
        if (success ) {
          this.setState({
            grid: response['Grid'],
            capturedCells: response['Visited'],
            turns: this.state.turns + 1,
            waiting: false,
            
          });
          if (this.state.capturedCells===196) {
            this.setState({
                    complete: true
                  })
                  alert("¡¡¡¡YOU WIN!!!!! TURNS: "+this.state.turns);
                }
        } else {
          // Prolog query will fail when the clicked color coincides with that in the top left cell.
          this.setState({
            waiting: false
          });
        }
      });
      recordColor.push(colorToCss(color));
      recordColor.reverse();
  }}
  //Controles del numero ingresado para la ayuda
  controls(n){
    let condition = true;
    if(isNaN(n)){
      alert("you must enter a number");
      condition = false;
    }
    if(n<0){
      alert("you must enter a natural number");
      condition = false;
    }
    return condition;
  }

  //Ayuda ¿clasica?
  helpPlugin(){
    this.setState.waiting = true;
    //console.log(this.state.helpNumber);
    if(this.controls(this.state.helpNumber)){
      if(corX== null && corY==null){
        corX = 0;
        corY = 0;
      }
      const gridS = JSON.stringify(this.state.grid).replaceAll('"', "");
      const queryHelp = "combsShell(" + gridS+"," + corX + "," + corY +"," + this.state.helpNumber+ ","+ this.state.capturedCells +",[]"+",BestSeq,BestCap)";
      //console.log(queryHelp);
      //if (this.state.complete === false){
        this.pengine.query(queryHelp, (success, response) => {
          console.log(response);
          if (success) {
            this.setState({
              show:true,
              helpResult: response['BestSeq'],     
              capturedHelp:response['BestCap'],
              waiting:false
            });
          } else {
            // Prolog query will fail when the clicked color coincides with that in the top left cell.
            this.setState({
              waiting: false
            });
          }
        });
        //console.log(this.state.helpResult);
        
    }
  }

  //Ayuda Greedy
  helpPluginGreedy(){
    this.setState.waiting = true;
    //console.log(this.state.helpNumber);
    if(this.controls(this.state.helpNumber)){
      if(corX== null && corY==null){
        corX = 0;
        corY = 0;
      }
      const gridS = JSON.stringify(this.state.grid).replaceAll('"', "");
      const queryGreedy = "greedy(" + gridS+"," + corX + "," + corY +"," + this.state.helpNumber+ ",HR,NM," + this.state.capturedCells+",FinalCap)";
      //console.log(queryGreedy);
      //if (this.state.complete === false){
        this.pengine.query(queryGreedy, (success, response) => {
          console.log(response);
          if (success) {
            this.setState({
              show:true,
              helpResult: response['HR'],     
              capturedHelp:response['FinalCap'],
              waiting:false
            });
            
          } else {
            // Prolog query will fail when the clicked color coincides with that in the top left cell.
            this.setState({
              waiting: false
            });
          }
        });
        //console.log(this.state.helpResult);
        
    }
    }
    //this.setState.waiting = false;
  //}

  handleChange(event) {    
    this.setState({helpNumber: event.target.value}); 
  }

  render() {
    if (this.state.grid === null) {
      return null;
    }
    return (
      <div className="game">
        <div className="leftPanel">
          <div className="buttonsPanel">
            {colors.map(color =>
              <button
                className="colorBtn"
                style={{ backgroundColor: colorToCss(color) }}
                onClick={() => this.handleClick(color)}
                key={color}
              />)}
          </div>
          <div className="turnsPanel">
            <div className="turnsLab">Turns</div>
            <div className="turnsNum">{this.state.turns}</div>
          </div>
          <div className="capturedPanel">
            <div className="turnsLab">Captured</div>
            <div className="turnsNum">{this.state.capturedCells}</div>
          </div>
          <div className="buttonsHelp">
            <div className="textBox">
              <input name='numbersHelp' type="text" value={this.state.helpNumber} onChange={this.handleChange}/>
            </div>
            <button className="helpBtn" onClick={() => {
                this.helpPlugin()
              }}>
                Help
            </button>
            <button className="helpBtnGreedy" onClick={() => {
                this.helpPluginGreedy()
              }}>
                Greedy Help
            </button>
          </div> 
        </div>
        <Board grid={this.state.grid} />
        <div className="scroll-bg">
        <div className="leftPanel">
          <div className="recordPanel">PREVIOUS MOVES</div></div>
           <div className="scroll-div">
              <div className="scroll-object">
                  {recordColor.map((recordColor) => {
                      return <p className="record" style={{backgroundColor: recordColor}}>{}</p>;
                  })} 
              </div> 
            </div>
            {this.state.show && (
              <div className="help">
                <div className="recordPanel">Recommended Moves</div>
                <div className="scroll-div">
                  <div className="scroll-object">
                    {this.state.helpResult.map((i) => {
                       return <p className="helpShow" style={{backgroundColor: colorToCss(i)}}>{}</p>;
                    })}
                  </div> 
                </div> 
              </div>
            )}
        </div>
        <div className="Explanation">
          <p><h3>Before playing please select a stating cell.</h3>

          The game consists of a 14 x 14 grid, where each cell is painted in one of 6 possible colors, and 6 
          buttons, one of each color. Press a colored button C
          causes the selected stating cell to be painted in color C', as well as all of the
          same color C' adjacent to it, and those of color C' adjacent to the latter, and so on,
          are painted color C.

          <h3>Game Objective:</h3>
          Win by painting all the cells of the same color, pressing the buttons as few times as possible.

          <h3>Requesting Help:</h3>
          On the left you will see a textbox, there you can type
          a positive number to have as the number of moves the game will help you with.

          On the right you will see a panel with a sequence of diferent colors, 
          those are the moves that guarantee the best outcume for the current grid you are playing with.</p>
        </div> 
      </div>
    );
  }
}
export default Game;