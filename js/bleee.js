// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Bodies = Matter.Bodies;

var engine = Engine.create();

var render = Render.create({
    element: document.body,
    engine: engine
});
render.options.wireframes = false;

var boxA = Bodies.rectangle(400, 200, 80, 80, { isStatic: true });

//create rope sections
group = Body.nextGroup(true);
var totalChains = 8;
var chainLength = 30;
var chainWidth = 15;
var ropeStiff = 1

var rope = Composites.stack(200, 50, totalChains, 1, 0, 0, function(x, y) {
    return Bodies.rectangle(x - 30, y, chainLength, chainWidth, { 
        collisionFilter:{ 
            group: -1 },
            chamfer: 7
            /*
            render: {
                fillStyle: 'white'
            }*/
    });
});
//create handle
var handleStart = Bodies.rectangle(500 , 58, chainLength, chainWidth, {chamfer: 7, render: {fillStyle: 'white'}});
var handleEnd = Bodies.polygon(520 , 58, 3, 25,{chamfer: 3, render: {fillStyle: 'white'}});

var handle = Body.create({
    collisionFilter:{
        group: -1
    },
    parts: [handleStart, handleEnd],
    chamfer: 2,
    render: {
        fillStyle: 'white'
    }
});


//chain rope together
Composites.chain(rope, 0.3, 0, -0.3, 0, {
    stiffness: ropeStiff,
    length: chainWidth/3,
    render: {
        fillStyle: 'white',
        lineWidth: chainWidth - 1
    }
});


//add point that rope is connected to
Composite.add(rope, Constraint.create({ 
    bodyB: rope.bodies[0],
    pointB: { x: -25, y: 0 },
    pointA: { x: rope.bodies[0].position.x, y: rope.bodies[0].position.y },
    stiffness: 0.7,
    length: 50,
    
}));

//attatch handle
var constraint = Constraint.create({
    bodyA: handle,
    pointA: { x: -25, y: 0 },
    bodyB: rope.bodies[totalChains - 1],
    pointB: { x: 15, y: 0 },
    length: 1,
    stiffness: ropeStiff,
    render: {
        strokeStyle: 'blue'
    }
    });

var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add mouse control
var mouse = Mouse.create(render.canvas),
mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.05,
        render: {
            visible: false
        }
    }
});


// add all of the bodies to the world
Composite.add(engine.world, [boxA,rope,ground,mouseConstraint,handle, constraint]);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);