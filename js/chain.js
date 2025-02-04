var Example = Example || {};
Example.chains = function() {
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

// create engine
var engine = Engine.create(),
    world = engine.world;
// create renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
    width: 800,
    height: 600,
    showAngleIndicator: true,
    showCollisions: true,
    showVelocity: true
    }
});

group = Body.nextGroup(true);
var ropeC = Composites.stack(600, 50, 13, 1, 10, 10, function(x, y) {
return Bodies.rectangle(x - 20, y, 50, 20, { collisionFilter: { group: group }, chamfer: 5 });
});
Composites.chain(ropeC, 0.3, 0, -0.3, 0, { stiffness: 1, length: 0 });
Composite.add(ropeC, Constraint.create({ 
bodyB: ropeC.bodies[0],
pointB: { x: -20, y: 0 },
pointA: { x: ropeC.bodies[0].position.x, y: ropeC.bodies[0].position.y },
stiffness: 0.5
}));
}