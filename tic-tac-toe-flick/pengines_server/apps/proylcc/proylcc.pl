:- module(proylcc, 
	[  
		flick/6,
        greedy/8,
        combsShell/8
        

	]).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% flick(+Grid, +Color, -FGrid)
%
% FGrid es el resultado de hacer 'flick' de la grilla Grid con el color Color.
% Retorna false si Color coincide con el color de la celda superior izquierda de la grilla. 
%
flick(Matrix,X,Y,NewColor,Captured,NewMatrix):-
    adyCStar(X,Y,Matrix,Res),
    replaceAll(Matrix,Res,NewColor,NewMatrix),
    adyCStar(X,Y,NewMatrix,CapturedList),
    length(CapturedList,Captured),!.

replaceAll(Matrix,[],_,Matrix):-!.
replaceAll(Matrix,[[X,Y]|Xs],NewColor,NewMatrix):-
    replacePosition(Matrix,[X,Y],NewColor,AuxMatrix),
    replaceAll(AuxMatrix,Xs,NewColor,NewMatrix).


replace_nth(N, OldElem, NewElem, List, List2):-
    length(L1, N),
    append(L1, [OldElem|Rest], List),
    append(L1, [NewElem|Rest], List2).

replacePosition(Matrix,[X,Y], NewValue, NewMatrix) :-
    replace_nth(X, Old1, New1, Matrix, NewMatrix),
    replace_nth(Y, _OldElem2, NewValue, Old1, New1).


otherColors(Color,R):-
    remove([r,g,y,p,v,b],Color,R).

remove([Color|Xs],Color,Xs).
remove([X|Xs],Color,[X|R]):-
    remove(Xs,Color,R).

getBetter([],Seq,Cap,Seq,Cap).
getBetter([[Seq,196,_NM]|_Ls],_,_,Seq,196).
getBetter([[Seq,Cap,_NM]|Ls],_CurrentSec,CurrentCap,BestSeq,BestCap):-
    Cap>CurrentCap,
    getBetter(Ls,Seq,Cap,BestSeq,BestCap).
getBetter([[_Sec,_Cap,_NM]|Ls],CurrentSec,CurrentCap,BestSeq,BestCap):-
    getBetter(Ls,CurrentSec,CurrentCap,BestSeq,BestCap).



combsShell(Matrix,X,Y,N,Cp,Seq,BestSeq,BestCap):-
    allCombinations(Matrix,X,Y,N,Cp,Seq,R),
    getBetter(R,Seq,Cp,BestSeq,BestCap),!.




allCombinations(R,_,_,_,196,_,R):-!.
allCombinations(Matrix,X,Y,N,CapturedBefore,MovementsList,Combinations):-
    color([X,Y],Matrix,Color),
    otherColors(Color,List),
    findall([NewML,CurrentCap,NewMatrix],(
                                         member(C,List),
                                         flick(Matrix,X,Y,C,CurrentCap,NewMatrix),
										 CurrentCap>CapturedBefore,
                                         append(MovementsList,[C],NewML)),
            BetterMoves),
    N1 is N-1,!,
    combinations(BetterMoves,X,Y,N1,Combinations).
    
combinations([],_,_,_,[]):-!.
combinations([[MList,196,NMatrix]],_X,_Y,_N,[[MList,196,NMatrix]]):-!.
combinations(X,_,_,0,X):-!.


combinations([[MList,CurrentCap,Matrix]|Ls],X,Y,N,LOut):-
    combinations(Ls,X,Y,N,Rs),
    allCombinations(Matrix,X,Y,N,CurrentCap,MList,R),
    append(R,Rs,LOut).

%Metodo Alternativo de captura
greedy(Matrix,_,_,0,[],Matrix,B,B):-!.

greedy(Matrix,X,Y,N,[B|ColorList],NewMatrix,_CurrentCap,FinalCap):-
    color([X,Y],Matrix,Color),
    otherColors(Color,OtherColors),
    getBestMove(Matrix,X,Y,OtherColors,0,_BColor,B), 
    flick(Matrix,X,Y,B,BCap,AuxMatrix),
   	N1 is N-1,!,
	greedy(AuxMatrix,X,Y,N1,ColorList,NewMatrix,BCap,FinalCap).


getBestMove(_Matrix,_,_,[],_BCap,BColor,BColor):-!.
getBestMove(Matrix,X,Y,[C|Cs],BCap,_BColor,B):-
    flick(Matrix,X,Y,C,Cap,_AuxMatrix),
    Cap>BCap,
    getBestMove(Matrix,X,Y,Cs,Cap,C,B).

getBestMove(Matrix,X,Y,[_C|Cs],BCap,BColor,B):-
    getBestMove(Matrix,X,Y,Cs,BCap,BColor,B).


%----------------------------------------------------

%Metodo de para obtener AdyacentesC* provisto por la catedra
/*
 * adyCStar(Origin, +Grid, -Res)
 * Calcula el conjunto de celdas adyacentesC* de la celda Origin en la grilla Grid
 * siguiendo una estrategia de propagación o expansión.
 */

adyCStar(X,Y, Grid, Res) :-
    adyCStarSpread([[X,Y]], [], Grid, Res).

/*
 * adyCStarSpread(+Pend, +Vis, +Grid, -Res)
 * Pend: por "pendientes", inicialmente es la lista [Origin], y en general es 
 * el conjunto de celdas adyacentesC* a Origin que aún no fueron consideradas.
 * Vis: por "visitados", inicialmente [], son las celdas adyacentesC* a la Origen 
 * que ya fueron consideradas.
 * Grid: idem adyCStar
 * Res: idem adyCStar
 * En cada paso se selecciona una celda de las pendientes, se pasa a visitados, y
 * se agregan a pendientes todas aquellas adyacentes a la celda, del mismo color, que no estén
 * ya ni en pendientes ni visitados.
 */

adyCStarSpread([], Vis, _Grid, Vis).

adyCStarSpread(Pend, Vis, Grid, Res):-
    Pend = [P|Ps],
    findall(A, 
	        (
    	        adyC(P, Grid, A),
        	    not(member(A, Pend)),
            	not(member(A, Vis))
	        ), 
            AdyCP),
    append(AdyCP, Ps, NPend),
    adyCStarSpread(NPend, [P|Vis], Grid, Res).

/* 
 * adyC(+P, +Grid, -A)
 */

adyC(P, Grid, A):-
    ady(P, Grid, A),
    color(P, Grid, C),
    color(A, Grid, C).

/* 
 * ady(+P, +Grid, -A)
 */

ady([X, Y], Grid, [X1, Y]):-
    length(Grid, L),
    X < L - 1,
    X1 is X + 1.

ady([X, Y], _Grid, [X1, Y]):-
    X > 0,
    X1 is X - 1.

ady([X, Y], Grid, [X, Y1]):-
    Grid = [F|_],
    length(F, L),
    Y < L - 1,
    Y1 is Y + 1.

ady([X, Y], _Grid, [X, Y1]):-
    Y > 0,
    Y1 is Y - 1.


/* 
 * color(P, Grid, C)
 */

color([X,Y], Grid, C):-
    nth0(X, Grid, F),
    nth0(Y, F, C).    















