export const Levels = [
  {
    t: "FIRST STAB",
    l: [
      [0, 5, 7, 5],
      [0, 10, 1, 10],
      [1, 10, 6, 8],
      [0, 2, 2, 6],
      [0, 5, 9, 8],
      [1, 2, 9, 7],
      [0, 5, 9, 14]
    ],
    e: [[16 * 12, 16 * 10, 7, 0]]
  }
];

/* ENEMY TYPES 

// e: x,y,type,facing

0 = Running
1 = Running, turning
2 = Walking
3 = Walking, turning
4 = Still
5 = Still, turning
6 = Sleeping, 10s
7 = Sleeping, 20s
8 = Sleeping, 30s

walkning < 4
highspeed, <2
turning, 1,3,5 = odd
sleeping > 5

*/

// xy = 240 möjliga - En char?
// l = 10 möjliga * 2 vertikal eller horizontal = 20 = 10 olika marktyper ok
// ===> Två bytes per plattform

// alt två bytes per rad * typer = Tre typer: 2 * 3 * 15 = 90 bytes level, motsvarar 45 plattformar med 10 kombiantioner.

/*
 x: 16 * 12, // starting x,y position of the sprite
    y: 16 * 10,
    color: "blue", // fill color of the sprite rectangle
    width: 16, // width and height of the sprite rectangle
    height: 32,
    blocked: { ...CDefaultBlocked },
    facing: -1, // -1 0 1 == left, none, right
    dy: 0,
    walks: true,
    turnTimer: 99,
    animations: spriteSheets[1].animations

*/
