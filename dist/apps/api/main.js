/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/api/src/app/game/game.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Game = void 0;
const tslib_1 = __webpack_require__("tslib");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
const game_lib_1 = __webpack_require__("./libs/game-lib/src/index.ts");
const dayjs_1 = tslib_1.__importDefault(__webpack_require__("dayjs"));
const duration_1 = tslib_1.__importDefault(__webpack_require__("dayjs/plugin/duration"));
const rxjs_1 = __webpack_require__("rxjs");
const gamesManager_1 = tslib_1.__importDefault(__webpack_require__("./apps/api/src/app/gamesManager/gamesManager.ts"));
dayjs_1.default.extend(duration_1.default);
class Game {
    constructor(players, gameMode) {
        this.gameMode = gameMode;
        this.players = [];
        this.gameHealth = this.checkHealth.bind(this);
        this.emitter = new rxjs_1.Subject();
        for (let player of players) {
            this.addPlayer(player);
        }
        this.engine = new BABYLON.NullEngine();
        this.game = new game_lib_1.Game(this.engine);
        this.intervalId = setInterval(this.gameHealth, 1000);
    }
    addPlayer(player) {
        player.on('disconnect', () => {
            this.players = this.players.filter(p => p.id !== player.id);
        });
        player.on('i', (i) => {
            const currentPlayer = this.game.mode.players.find(p => p.id === player.id);
            currentPlayer.inputs = i;
        });
        this.players.push(player);
    }
    init() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.game.init();
            this.emitter = this.game.emitter;
            this.emitter.subscribe((req) => {
                for (let player of this.players)
                    player.emit(req.event, req.args);
            });
            this.game.setMode(this.gameMode);
            this.game.mode.addPlayers(this.players);
        });
    }
    checkHealth() {
        if (this.players.length === 0) {
            console.log("GAME DESTROYED");
            this.stop();
        }
        else {
            console.log("GAME HEALTHY");
        }
    }
    stop() {
        clearInterval(this.intervalId);
        this.game.scene.dispose();
        this.engine.dispose();
        gamesManager_1.default.remove(this);
    }
}
exports.Game = Game;


/***/ }),

/***/ "./apps/api/src/app/gamesManager/gamesManager.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const game_1 = __webpack_require__("./apps/api/src/app/game/game.ts");
class GamesManager {
    constructor() {
        this.games = [];
        console.log("Game manager ON");
    }
    createGame(players, gameMode) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const game = new game_1.Game(players, gameMode);
            yield game.init();
            this.games.push(game);
            return game;
        });
    }
    remove(game) {
        this.games = this.games.filter(g => g !== game);
    }
}
exports["default"] = new GamesManager();


/***/ }),

/***/ "./apps/api/src/app/lifecycle.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const main_1 = __webpack_require__("./apps/api/src/main.ts");
const queue_1 = tslib_1.__importDefault(__webpack_require__("./apps/api/src/app/queue/queue.ts"));
main_1.io.on('connection', (socket) => {
    console.log("New client", socket.id);
    socket.on('disconnect', () => {
        queue_1.default.removePlayer(socket);
        console.log("Client left", socket.id);
    });
    socket.on('queue', (gameModes = ['Soccer']) => {
        queue_1.default.addPlayer(socket, gameModes);
    });
    socket.on('pseudo', (pseudo) => {
        socket.pseudo = pseudo;
        socket.emit('pseudoSet', pseudo);
    });
    socket.on('leaveQueue', () => {
        queue_1.default.removePlayer(socket);
    });
});


/***/ }),

/***/ "./apps/api/src/app/queue/queue.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__("tslib");
const gamesManager_1 = tslib_1.__importDefault(__webpack_require__("./apps/api/src/app/gamesManager/gamesManager.ts"));
class Queue {
    constructor() {
        this.players = [];
        this.gameModes = ['Soccer'];
        this.minPlayers = 1;
        this.loopIntervalId = setInterval(() => {
            this.checkQueue();
            this.queueState();
        }, 2000);
    }
    checkQueue() {
        for (let gameMode of this.gameModes.reverse()) {
            const queue = this.players.filter(p => p.gamesModes.includes(gameMode));
            for (let i = 0; i < Math.floor(queue.length / this.minPlayers); i++) {
                console.log("CREATING A GAME mode :", gameMode);
                const players = queue.splice(0, this.minPlayers);
                this.createGame(players, gameMode);
                this.players = this.players.filter(p => !players.includes(p));
            }
        }
    }
    createGame(players, gameMode) {
        console.log("CREATING GAME...");
        const game = gamesManager_1.default.createGame(players, gameMode);
        console.log(`${gamesManager_1.default.games.length} total games`);
        return game;
    }
    addPlayer(socket, gameModes) {
        if (this.players.find(player => player === socket))
            return;
        socket.gamesModes = gameModes;
        this.players.push(socket);
        console.log(`${this.players.length} in queue for ${socket.gamesModes.join(' & ')}`);
        this.sendQueueStateToPlayer(socket);
    }
    removePlayer(socket) {
        this.players = this.players.filter(player => player !== socket);
        socket.emit('queueLeft');
    }
    queueState() {
        for (let player of this.players) {
            this.sendQueueStateToPlayer(player);
        }
    }
    sendQueueStateToPlayer(socket) {
        socket.volatile.emit('queueState', {
            inQueue: this.players.length,
            position: this.players.findIndex(player => player === socket) + 1,
            gameModes: socket.gamesModes || [],
            inQueueSoccer: this.players.filter(p => p.gamesModes.includes('Soccer')).length,
        });
    }
}
exports["default"] = new Queue();


/***/ }),

/***/ "./apps/api/src/main.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.io = void 0;
const tslib_1 = __webpack_require__("tslib");
const express_1 = tslib_1.__importDefault(__webpack_require__("express"));
const path_1 = tslib_1.__importDefault(__webpack_require__("path"));
const app = express_1.default();
const cookieParser = __webpack_require__("cookie-parser");
const socketIO = __webpack_require__("socket.io");
const http = __webpack_require__("http");
const server = http.createServer(app);
exports.io = socketIO(server, {
    path: "/api/socket/",
    transports: ['websocket', 'polling'],
});
app.get('/api', (req, res) => {
    res.send({ version: process.env.NX_VERSION });
});
app.use('/', express_1.default.static(path_1.default.join(__dirname, '../game/')));
app.use('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../game/index.html'));
});
app.use(cookieParser());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true
}));
const port = process.env.PORT || 3333;
server.listen(port);
server.on('error', console.error);
__webpack_require__("./apps/api/src/app/lifecycle.ts");


/***/ }),

/***/ "./libs/game-lib/src/index.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TICK_RATE = void 0;
const tslib_1 = __webpack_require__("tslib");
tslib_1.__exportStar(__webpack_require__("./libs/game-lib/src/lib/game-lib.ts"), exports);
tslib_1.__exportStar(__webpack_require__("./libs/game-lib/src/lib/interfaces.ts"), exports);
// export * from './lib/src/player';
// export * from './lib/src/soccer';
tslib_1.__exportStar(__webpack_require__("./libs/game-lib/src/lib/src/modes/soccer/soccer.ts"), exports);
exports.TICK_RATE = 60;


/***/ }),

/***/ "./libs/game-lib/src/lib/game-lib.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Game = void 0;
const tslib_1 = __webpack_require__("tslib");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
const ammo_js_1 = tslib_1.__importDefault(__webpack_require__("ammo.js"));
const input_1 = __webpack_require__("./libs/game-lib/src/lib/src/input.ts");
const skybox_1 = __webpack_require__("./libs/game-lib/src/lib/src/misc/skybox.ts");
const soccer_1 = __webpack_require__("./libs/game-lib/src/lib/src/modes/soccer/soccer.ts");
const rxjs_1 = __webpack_require__("rxjs");
BABYLON.Animation.AllowMatricesInterpolation = true;
class Game {
    constructor(engine, options = {}) {
        this.engine = engine;
        this.options = options;
        this.server = false;
        this.currentInputs = {};
        this.emitter = new rxjs_1.Subject();
        this.currentState = new rxjs_1.BehaviorSubject('title-screen');
        this.engine = engine;
        this.scene = new BABYLON.Scene(this.engine);
        this.camera = new BABYLON.ArcRotateCamera('main', -Math.PI / 2, 1, 200, new BABYLON.Vector3(0, 1, 0), this.scene);
        this.camera.fov = 0.7;
        if (options.canvas) {
            this.canvas = options.canvas;
            this.camera.attachControl(this.canvas);
            this.skybox = new skybox_1.Skybox(this);
        }
        else
            this.server = true;
        this.options = options;
        this.input = new input_1.Input(this);
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }
    init() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const ammo = yield ammo_js_1.default();
            this.scene.enablePhysics(new BABYLON.Vector3(0, -40, 0), new BABYLON.AmmoJSPlugin(true, ammo));
            // this.setMode('Soccer')
            // if(this.mode) {
            //   this.mode.players = [ new SoccerPlayer(this, this.mode!, 0)]
            //   this.mode.players[0].setId('SELF')
            // }
        });
    }
    setMode(mode) {
        console.log('INIT ' + mode);
        if (mode === 'Soccer')
            this.mode = new soccer_1.Soccer(this);
        if (this.mode)
            this.mode.init();
    }
}
exports.Game = Game;


/***/ }),

/***/ "./libs/game-lib/src/lib/interfaces.ts":
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./libs/game-lib/src/lib/src/input.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Input = void 0;
const tslib_1 = __webpack_require__("tslib");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
class Input {
    constructor(game) {
        this.keys = {
            UP: ['Z', 'STICK_UP'],
            DOWN: ['S', 'STICK_DOWN'],
            RIGHT: ['D', 'STICK_RIGHT'],
            LEFT: ['Q', 'STICK_LEFT'],
            LEFT_TRIGGER: ['LEFT_TRIGGER'],
            RIGHT_TRIGGER: ['SHIFT', 'RIGHT_TRIGGER'],
            A: ['PAD_A', 'PAD_Cross'],
            B: ['LMB', 'PAD_B', 'PAD_Circle'],
            X: ['PAD_X', 'PAD_Square'],
            Y: ['PAD_Y', 'PAD_Triangle'],
            RB: ['PAD_RB', 'PAD_L1'],
            LB: ['PAD_LB', 'PAD_R1'],
        };
        this.inputs = {};
        this.game = game;
        this.game.scene.actionManager =
            new BABYLON.ActionManager(this.game.scene);
        const am = this.game.scene.actionManager;
        this.gamepadManager = new BABYLON.GamepadManager();
        am.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputs[evt.sourceEvent.key.toUpperCase()] = evt.sourceEvent.type == "keydown" ? 1 : 0;
        }));
        am.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputs[evt.sourceEvent.key.toUpperCase()] = evt.sourceEvent.type == "keydown" ? 1 : 0;
        }));
        this.game.scene.onPointerObservable.add((event) => {
            if (event.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                if (event.event.button === 0)
                    this.inputs['LMB'] = 1;
                else if (event.event.button === 2)
                    this.inputs['RMB'] = 1;
                else if (event.event.button === 1)
                    this.inputs['MMB'] = 1;
            }
            else if (event.type === BABYLON.PointerEventTypes.POINTERUP) {
                if (event.event.button === 0)
                    this.inputs['LMB'] = 0;
                else if (event.event.button === 2)
                    this.inputs['RMB'] = 0;
                else if (event.event.button === 1)
                    this.inputs['MMB'] = 0;
            }
        });
        this.gamepadManager.onGamepadConnectedObservable.add((gamepad, state) => {
            gamepad.onleftstickchanged((values) => {
                this.inputs['STICK_UP'] = 0;
                this.inputs['STICK_DOWN'] = 0;
                this.inputs['STICK_RIGHT'] = 0;
                this.inputs['STICK_LEFT'] = 0;
                if (Math.abs(values.y) > 0.1) {
                    if (values.y < 0)
                        this.inputs['STICK_UP'] = Math.abs(values.y);
                    else
                        this.inputs['STICK_DOWN'] = Math.abs(values.y);
                }
                if (Math.abs(values.x) > 0.1) {
                    if (values.x < 0)
                        this.inputs['STICK_LEFT'] = Math.abs(values.x);
                    else
                        this.inputs['STICK_RIGHT'] = Math.abs(values.x);
                }
            });
            if (gamepad instanceof BABYLON.Xbox360Pad) {
                gamepad.onlefttriggerchanged((value) => {
                    if (value > 0.1)
                        this.inputs['LEFT_TRIGGER'] = 1;
                    else
                        this.inputs['LEFT_TRIGGER'] = 0;
                });
                gamepad.onrighttriggerchanged((value) => {
                    if (value > 0.1)
                        this.inputs['RIGHT_TRIGGER'] = 1;
                    else
                        this.inputs['RIGHT_TRIGGER'] = 0;
                });
                gamepad.onButtonDownObservable.add((button) => {
                    this.inputs[`PAD_${BABYLON.Xbox360Button[button]}`] = 1;
                });
                gamepad.onButtonUpObservable.add((button) => {
                    this.inputs[`PAD_${BABYLON.Xbox360Button[button]}`] = 0;
                });
            }
            if (gamepad instanceof BABYLON.DualShockPad) {
                gamepad.onButtonDownObservable.add((button, state) => {
                    console.log(button, "PS4", BABYLON.DualShockButton[button]);
                    this.inputs[`PAD_${BABYLON.DualShockButton[button]}`] = 1;
                });
                gamepad.onButtonUpObservable.add((button, state) => {
                    this.inputs[`PAD_${BABYLON.DualShockButton[button]}`] = 0;
                });
                gamepad.onlefttriggerchanged((value) => {
                    if (value > 0.1)
                        this.inputs['LEFT_TRIGGER'] = 1;
                    else
                        this.inputs['LEFT_TRIGGER'] = 0;
                });
                gamepad.onrighttriggerchanged((value) => {
                    if (value > 0.1)
                        this.inputs['RIGHT_TRIGGER'] = 1;
                    else
                        this.inputs['RIGHT_TRIGGER'] = 0;
                });
            }
        });
    }
    getInputs() {
        const i = {};
        for (let [key, value] of Object.entries(this.inputs)) {
            if (value > 0) {
                const actionName = this.getActionName(key);
                if (actionName)
                    i[actionName] = value;
            }
        }
        return i;
    }
    getActionName(key) {
        for (let [action, keys] of Object.entries(this.keys)) {
            if (keys.includes(key))
                return action;
        }
        return false;
    }
}
exports.Input = Input;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/misc/skybox.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Skybox = void 0;
const tslib_1 = __webpack_require__("tslib");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
const gsap_1 = tslib_1.__importDefault(__webpack_require__("gsap"));
class Skybox {
    constructor(game) {
        this.game = game;
        this.time = 12;
        this.generateLight();
        this.generateSkybox();
        this.shadowGenerator = new BABYLON.ShadowGenerator(1024, this.light);
        this.shadowGenerator.useBlurExponentialShadowMap = true;
        this.shadowGenerator.blurScale = 2;
        this.shadowGenerator.darkness = 0.5;
        this.game.scene.registerBeforeRender(() => {
            // this.time += 0.0016
        });
    }
    generateLight() {
        this.hemisphericLight = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 2, 0), this.game.scene);
        this.hemisphericLight.intensity = 0.7;
        this.light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -2, -1), this.game.scene);
        this.light.intensity = 1;
        this.light.position = new BABYLON.Vector3(20, 40, 20);
    }
    generateSkybox() {
        const dayMaterial = new BABYLON.StandardMaterial("skyBox", this.game.scene);
        dayMaterial.backFaceCulling = false;
        dayMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/sunny", this.game.scene);
        dayMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        dayMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        dayMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        const nightMaterial = new BABYLON.StandardMaterial("skyBox", this.game.scene);
        nightMaterial.backFaceCulling = false;
        nightMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/night", this.game.scene);
        nightMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        nightMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        nightMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        this.skyboxDay = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1080 }, this.game.scene);
        this.skyboxNight = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1050 }, this.game.scene);
        this.skyboxDay.material = dayMaterial;
        this.skyboxNight.material = nightMaterial;
        this.skyboxDay.visibility = 0.5;
        this.skyboxNight.visibility = 0;
        this.game.scene.registerBeforeRender(this.timeCycle.bind(this));
    }
    timeCycle() {
        if (this.time >= 24)
            this.time = 0;
        const dayVisibility = gsap_1.default.utils.pipe(gsap_1.default.utils.mapRange(0, 24, 0, 1), gsap_1.default.utils.interpolate([0, 1, 0]));
        const nightVisibility = gsap_1.default.utils.pipe(gsap_1.default.utils.mapRange(0, 24, 0, 1), gsap_1.default.utils.interpolate([1, 0, 1]));
        const lightIntensity = gsap_1.default.utils.pipe(gsap_1.default.utils.mapRange(0, 24, 0, 1), gsap_1.default.utils.interpolate([0.2, 0.8, 0.2]));
        const hemisphericLightIntensity = gsap_1.default.utils.pipe(gsap_1.default.utils.mapRange(0, 24, 0, 1), gsap_1.default.utils.interpolate([0.1, 0.5, 0.1]));
        const color = gsap_1.default.utils.pipe(gsap_1.default.utils.mapRange(0, 24, 0, 1), gsap_1.default.utils.interpolate(['#2222ff', '#ffffff', '#2222ff']));
        const rotation = gsap_1.default.utils.pipe(gsap_1.default.utils.mapRange(0, 24, 0, Math.PI * 2));
        this.skyboxDay.visibility = dayVisibility(this.time);
        this.skyboxNight.visibility = nightVisibility(this.time);
        this.light.intensity = lightIntensity(this.time);
        this.hemisphericLight.intensity = hemisphericLightIntensity(this.time);
        this.skyboxDay.rotation.y = rotation(this.time);
        this.skyboxNight.rotation.y = -rotation(this.time);
        const c = gsap_1.default.utils.splitColor(color(this.time));
        this.hemisphericLight.diffuse = new BABYLON.Color3(gsap_1.default.utils.mapRange(0, 255, 0, 1, c[0]), gsap_1.default.utils.mapRange(0, 255, 0, 1, c[1]), gsap_1.default.utils.mapRange(0, 255, 0, 1, c[2]));
    }
}
exports.Skybox = Skybox;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/misc/smoothAnimations.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SmoothAnimation = void 0;
const tslib_1 = __webpack_require__("tslib");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
class SmoothAnimation {
    constructor(game, animations) {
        this.game = game;
        this.animations = animations;
        this.weightAnimations = [];
        this.currentAnimation = '';
        this.weightAnimations = this.animations.map(anim => ({ weight: 0, animation: anim }));
        for (let wa of this.weightAnimations) {
            wa.animation.start(true);
            wa.animation.setWeightForAllAnimatables(0);
            if (wa.animation.name === 'Idle') {
                wa.animation.setWeightForAllAnimatables(1);
                wa.weight = 1;
            }
            else {
                wa.animation.setWeightForAllAnimatables(0);
                wa.weight = 0;
            }
        }
    }
    loop() {
        for (let wa of this.weightAnimations) {
            if (wa.animation.name.toLocaleUpperCase() === this.currentAnimation) {
                wa.weight = BABYLON.Scalar.Clamp(wa.weight + 0.05, 0, 1);
            }
            else {
                wa.weight = BABYLON.Scalar.Clamp(wa.weight - 0.05, 0, 1);
            }
            wa.animation.setWeightForAllAnimatables(wa.weight);
        }
    }
    play(name, speed) {
        this.currentAnimation = name;
        if (speed) {
            const wa = this.weightAnimations.find(a => a.animation.name.toLocaleUpperCase() === name);
            if (wa)
                wa.animation.speedRatio = speed;
        }
    }
}
exports.SmoothAnimation = SmoothAnimation;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/misc/uv.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setUVScale = void 0;
const tslib_1 = __webpack_require__("tslib");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
function setUVScale(mesh, uScale, vScale) {
    var i, UVs = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind), len = UVs.length || 0;
    if (uScale !== 1) {
        for (i = 0; i < len; i += 2) {
            UVs[i] *= uScale;
        }
    }
    if (vScale !== 1) {
        for (i = 1; i < len; i += 2) {
            UVs[i] *= vScale;
        }
    }
    mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, UVs || []);
}
exports.setUVScale = setUVScale;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/modes/soccer/ball.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoccerBall = void 0;
const tslib_1 = __webpack_require__("tslib");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
class SoccerBall {
    constructor(game, mode) {
        this.game = game;
        this.mode = mode;
        this.maxSpeed = 140;
        this.mesh = BABYLON.MeshBuilder.CreateSphere('ball', { diameter: 2 });
        this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 5, restitution: 0.5 });
        // if(this.game.canvas) this.mesh.physicsImpostor.mass = 0
        this.mesh.position.y = 10;
        if (this.game.canvas)
            this.game.skybox.shadowGenerator.addShadowCaster(this.mesh);
        const ballMaterial = new BABYLON.StandardMaterial("ball", this.game.scene);
        const texture = new BABYLON.Texture("assets/textures/amiga.jpg", this.game.scene);
        ballMaterial.ambientTexture = texture;
        this.mesh.material = ballMaterial;
        const trail = new BABYLON.TrailMesh('ball-trail', this.mesh, this.game.scene, 0.5);
        const sourceMat = new BABYLON.StandardMaterial('sourceMat', this.game.scene);
        sourceMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
        sourceMat.specularColor = BABYLON.Color3.White();
        sourceMat.alpha = 0.2;
        trail.material = sourceMat;
    }
    update() {
        if (this.mesh.physicsImpostor) {
            this.mesh.physicsImpostor.setLinearVelocity(this.mesh.physicsImpostor.getLinearVelocity().scale(0.995));
            this.mesh.physicsImpostor.setAngularVelocity(this.mesh.physicsImpostor.getAngularVelocity().scale(0.995));
            if (this.mesh.physicsImpostor.getLinearVelocity().length() > this.maxSpeed) {
                this.mesh.physicsImpostor.setLinearVelocity(this.mesh.physicsImpostor.getLinearVelocity().normalize().scale(this.maxSpeed));
            }
        }
        //
    }
    getState() {
        var _a, _b;
        const linear = (_a = this.mesh.physicsImpostor) === null || _a === void 0 ? void 0 : _a.getLinearVelocity();
        const angular = (_b = this.mesh.physicsImpostor) === null || _b === void 0 ? void 0 : _b.getAngularVelocity();
        return {
            position: {
                x: this.mesh.position.x,
                y: this.mesh.position.y,
                z: this.mesh.position.z,
            },
            linearVelocity: {
                x: linear === null || linear === void 0 ? void 0 : linear.x,
                y: linear === null || linear === void 0 ? void 0 : linear.y,
                z: linear === null || linear === void 0 ? void 0 : linear.z,
            },
            angularVelocity: {
                x: angular === null || angular === void 0 ? void 0 : angular.x,
                y: angular === null || angular === void 0 ? void 0 : angular.y,
                z: angular === null || angular === void 0 ? void 0 : angular.z,
            }
        };
    }
    setState(ballState) {
        var _a, _b;
        this.mesh.position.x = ballState.position.x;
        this.mesh.position.y = ballState.position.y;
        this.mesh.position.z = ballState.position.z;
        (_a = this.mesh.physicsImpostor) === null || _a === void 0 ? void 0 : _a.setAngularVelocity(new BABYLON.Vector3(ballState.angularVelocity.x, ballState.angularVelocity.y, ballState.angularVelocity.z));
        (_b = this.mesh.physicsImpostor) === null || _b === void 0 ? void 0 : _b.setLinearVelocity(new BABYLON.Vector3(ballState.linearVelocity.x, ballState.linearVelocity.y, ballState.linearVelocity.z));
    }
    destroy() {
        this.mesh.dispose();
    }
}
exports.SoccerBall = SoccerBall;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/modes/soccer/player.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoccerPlayer = void 0;
const player_1 = __webpack_require__("./libs/game-lib/src/lib/src/player/player.ts");
class SoccerPlayer extends player_1.BasePlayer {
    constructor(g, mode, teamId) {
        super(g);
        this.g = g;
        this.mode = mode;
        this.teamId = teamId;
        if (this.renderer)
            this.renderer.lookAt = this.mode.ball.mesh;
    }
    loop() {
        if (this.mode.fsm.state.kickoff) {
            this.g.input.inputs = {};
        }
        super.loop();
    }
    getState() {
        return {
            id: this.id,
            pseudo: this.pseudo || 'Anon',
            position: {
                x: this.collider.position.x,
                y: this.collider.position.y,
                z: this.collider.position.z,
            },
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y,
                z: this.velocity.z,
            },
            action: 'NONE' //TODO: Yelling, calling ...
        };
    }
    setState(playerState) {
        this.collider.position.x = playerState.position.x;
        this.collider.position.y = playerState.position.y;
        this.collider.position.z = playerState.position.z;
    }
}
exports.SoccerPlayer = SoccerPlayer;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/modes/soccer/soccer.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Soccer = void 0;
const tslib_1 = __webpack_require__("tslib");
const ball_1 = __webpack_require__("./libs/game-lib/src/lib/src/modes/soccer/ball.ts");
const player_1 = __webpack_require__("./libs/game-lib/src/lib/src/modes/soccer/player.ts");
const world_1 = __webpack_require__("./libs/game-lib/src/lib/src/modes/soccer/world.ts");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
const soccerFSM_1 = __webpack_require__("./libs/game-lib/src/lib/src/modes/soccer/soccerFSM.ts");
const soccerUI_1 = __webpack_require__("./libs/game-lib/src/lib/src/modes/soccer/soccerUI.ts");
class Soccer {
    constructor(game) {
        this.game = game;
        this.players = [];
        this.loopCall = this.loop.bind(this);
        this.serverLoop = this.server.bind(this);
    }
    init() {
        this.world = new world_1.SoccerWorld(this.game, this);
        this.ball = new ball_1.SoccerBall(this.game, this);
        this.players = [];
        this.fsm = new soccerFSM_1.SoccerFSM(this.game, this);
        this.ui = new soccerUI_1.SoccerUI(this.game, this);
        this.game.scene.registerBeforeRender(this.loopCall);
        if (!this.game.canvas) {
            this.game.scene.registerBeforeRender(this.serverLoop);
            this.game.emitter.next({ event: 'gInfo', args: this.gInfo() });
            //TODO: Think about a way to send gInfo to newcomers
        }
        this.game.currentState.next('Soccer');
    }
    server() {
        this.game.emitter.next({ event: 'g', args: this.getState() });
    }
    gInfo() {
        return {
            gameMode: "Soccer",
        };
    }
    getState() {
        return Object.assign({ ball: this.ball.getState(), players: this.players.map(p => p.getState()) }, this.fsm.getState());
    }
    setState(state) {
        this.ball.setState(state.ball);
        this.setPlayerState(state.players);
        this.fsm.setState(state);
    }
    setPlayerState(players) {
        for (let player of players) {
            let currentPlayer = this.players.find(p => p.id === player.id);
            if (!currentPlayer) {
                console.debug();
                currentPlayer = new player_1.SoccerPlayer(this.game, this, 0);
                currentPlayer.setId(player.id);
                currentPlayer.setPseudo(player.pseudo);
                this.players.push(currentPlayer);
            }
            currentPlayer.setState(player);
        }
    }
    kickOffPosition() {
        var _a, _b;
        const place = (team, index) => {
            return new BABYLON.Vector3(((team ? -1 : 1) * this.world.settings.width / 3) * ((index === 0) ? 0.5 : 1), 3, (index === 0) ? 0 : (index === 1) ? this.world.settings.depth / 4 : -this.world.settings.depth / 4);
        };
        this.ball.mesh.position = new BABYLON.Vector3(0, 2, 0);
        (_a = this.ball.mesh.physicsImpostor) === null || _a === void 0 ? void 0 : _a.setAngularVelocity(BABYLON.Vector3.Zero());
        (_b = this.ball.mesh.physicsImpostor) === null || _b === void 0 ? void 0 : _b.setLinearVelocity(BABYLON.Vector3.Zero());
        this.players.filter(p => p.teamId === 0).map((p, i) => {
            p.collider.position = place(p.teamId, i);
            p.collider.lookAt(this.ball.mesh.position, Math.PI, 0, 0, BABYLON.Space.WORLD);
        });
        this.players.filter(p => p.teamId === 1).map((p, i) => {
            p.collider.position = place(p.teamId, i);
            p.collider.lookAt(this.ball.mesh.position, Math.PI, 0, 0, BABYLON.Space.WORLD);
        });
    }
    gameOver() {
        const overCamera = new BABYLON.FreeCamera('game_over_camera', new BABYLON.Vector3(0, 5, 25), this.game.scene);
        overCamera.target = BABYLON.Vector3.Zero();
        const spacing = 6;
        const winnerTeam = this.fsm.state.score[0] >= this.fsm.state.score[1] ? 0 : 1;
        const winners = this.players.filter(p => p.teamId === winnerTeam);
        const losers = this.players.filter(p => p.teamId !== winnerTeam);
        losers.map((p) => p.destroy());
        const startAt = -((winners.length + 1) / 2) * spacing;
        winners.map((p, i) => {
            p.collider.position = new BABYLON.Vector3(startAt + (i + 1) * spacing, 5, 0);
            console.log('lookAt over');
            p.collider.lookAt(overCamera.position, Math.PI, 0, 0, BABYLON.Space.WORLD);
            if (p.renderer)
                p.renderer.lookAt = overCamera;
        });
        this.ball.mesh.position = new BABYLON.Vector3(0, 20, 8);
        this.game.scene.switchActiveCamera(overCamera);
    }
    loop() {
        this.ball.update();
        this.fsm.transition();
        this.ui.update();
    }
    destroy() {
        this.game.scene.unregisterBeforeRender(this.loopCall);
        this.world.destroy();
        this.ball.destroy();
        for (let player of this.players)
            player.destroy();
    }
    addPlayers(players) {
        for (let player of players) {
            const p = new player_1.SoccerPlayer(this.game, this, 0);
            p.id = player.id;
            p.pseudo = player.pseudo || 'John';
            this.players.push(p);
        }
    }
}
exports.Soccer = Soccer;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/modes/soccer/soccerFSM.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoccerFSM = void 0;
const tslib_1 = __webpack_require__("tslib");
const dayjs_1 = tslib_1.__importDefault(__webpack_require__("dayjs"));
class SoccerFSM {
    constructor(game, mode) {
        this.game = game;
        this.mode = mode;
        this.currentState = 'UNKNOWN';
        this.state = {
            started: false,
            celebration: false,
            kickoff: false,
            end: dayjs_1.default().add(5, 'minutes'),
            score: [0, 0]
        };
    }
    transition() {
        this.checkState('UNKNOWN', 'WAITING_FOR_PLAYERS', () => true);
        this.checkState('WAITING_FOR_PLAYERS', 'KICKOFF', this.isPlayerReady.bind(this));
        this.checkState('KICKOFF', 'GAMEPLAY', this.isKickoffDone.bind(this));
        this.checkState('GAMEPLAY', 'GOAL_CELEBRATION', this.isGoalScored.bind(this));
        this.checkState('GOAL_CELEBRATION', 'KICKOFF', this.isCelebrationOver.bind(this));
        this.checkState('GAMEPLAY', 'BALL_OUT', this.isBallOut.bind(this));
        this.checkState('BALL_OUT', 'KICKOFF', () => true);
        this.checkState('GAMEPLAY', 'GAME_OVER', this.isTimeOver.bind(this));
        this.checkState('GAME_OVER', 'GAME_DESTROY', this.isTimeOver.bind(this));
    }
    changeState(to) {
        console.debug(`${this.currentState} >>> ${to}`);
        this.currentState = to;
        switch (to) {
            case 'KICKOFF':
                console.log(this.state.score);
                this.state.kickoff = true;
                setTimeout(() => this.state.kickoff = false, 3000);
                this.mode.kickOffPosition();
                break;
            case 'GOAL_CELEBRATION':
                console.log(this.state.score);
                this.state.celebration = true;
                setTimeout(() => this.state.celebration = false, 3000);
                break;
            case 'GAME_OVER':
                this.state.end = dayjs_1.default().add(5, 'minutes');
                this.mode.gameOver();
                break;
            case 'GAME_DESTROY':
                this.mode.destroy();
        }
    }
    checkState(from, to, condition) {
        if (from === this.currentState && condition())
            this.changeState(to);
    }
    isPlayerReady() {
        return true;
    }
    isKickoffDone() {
        return this.state.kickoff === false;
    }
    isTimeOver() {
        return this.state.end <= dayjs_1.default();
    }
    isCelebrationOver() {
        return this.state.celebration === false;
    }
    isGoalScored() {
        let isScored = false;
        if (this.mode.world.blueGoalZone.intersectsMesh(this.mode.ball.mesh)) {
            this.state.score[0] += 1;
            isScored = true;
        }
        else if (this.mode.world.redGoalZone.intersectsMesh(this.mode.ball.mesh)) {
            this.state.score[1] += 1;
            isScored = true;
        }
        return isScored;
    }
    isBallOut() {
        if (Math.abs(this.mode.ball.mesh.position.z) > this.mode.world.settings.depth / 2 + 10)
            return true;
        if (Math.abs(this.mode.ball.mesh.position.x) > this.mode.world.settings.width / 2 + 10)
            return true;
        return false;
    }
    getState() {
        return {
            currentState: this.currentState,
            state: this.state
        };
    }
    setState(state) {
        state.state.end = dayjs_1.default(state.state.end);
        this.state = state.state;
        if (this.currentState !== state.currentState)
            this.changeState(state.currentState);
    }
}
exports.SoccerFSM = SoccerFSM;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/modes/soccer/soccerUI.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoccerUI = void 0;
const tslib_1 = __webpack_require__("tslib");
const rxjs_1 = __webpack_require__("rxjs");
const dayjs_1 = tslib_1.__importDefault(__webpack_require__("dayjs"));
class SoccerUI {
    constructor(game, mode) {
        this.game = game;
        this.mode = mode;
        this.scoreRed = new rxjs_1.BehaviorSubject(mode.fsm.state.score[0]);
        this.scoreBlue = new rxjs_1.BehaviorSubject(mode.fsm.state.score[1]);
        this.currentState = new rxjs_1.BehaviorSubject(mode.fsm.currentState);
        this.end = new rxjs_1.BehaviorSubject(mode.fsm.state.end);
        this.timeLeft = new rxjs_1.BehaviorSubject(Math.floor(mode.fsm.state.end.diff(dayjs_1.default()) / 1000));
        console.log(this.timeLeft.value);
    }
    update() {
        this.updateItem(this.scoreRed, this.mode.fsm.state.score[0]);
        this.updateItem(this.scoreBlue, this.mode.fsm.state.score[1]);
        this.updateItem(this.currentState, this.mode.fsm.currentState);
        this.updateItem(this.end, this.mode.fsm.state.end);
        this.updateItem(this.timeLeft, Math.floor(this.mode.fsm.state.end.diff(dayjs_1.default()) / 1000));
    }
    updateItem(subject, value) {
        subject.next(value);
    }
}
exports.SoccerUI = SoccerUI;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/modes/soccer/world.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoccerWorld = void 0;
const tslib_1 = __webpack_require__("tslib");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
const gsap_1 = tslib_1.__importDefault(__webpack_require__("gsap"));
const uv_1 = __webpack_require__("./libs/game-lib/src/lib/src/misc/uv.ts");
class SoccerWorld {
    constructor(game, soccer) {
        this.game = game;
        this.soccer = soccer;
        this.lines = [];
        this.borders = [];
        this.lights = [];
        this.redGoal = [];
        this.blueGoal = [];
        this.settings = {
            width: 250, depth: 140, thickness: 1, borderHeight: 5,
            borderTickness: 0.5, goalWidth: 40, goalHeight: 15, underOffset: 15,
            goalDepth: 20
        };
        this.field = this.createField();
        this.under = this.createUnder();
        this.borders = this.createBorders();
        this.createGoals();
        if (this.game.canvas) {
            this.lines = this.createLines();
            this.lights = this.createLights();
            this.applyTextures();
            this.enableShadows();
        }
    }
    destroy() {
        this.field.dispose();
        this.under.dispose();
        this.redGoalZone.dispose();
        this.blueGoalZone.dispose();
        for (let item of this.lines)
            item.dispose();
        for (let item of this.borders)
            item.dispose();
        for (let item of this.lights)
            item.dispose();
        for (let item of this.redGoal)
            item.dispose();
        for (let item of this.blueGoal)
            item.dispose();
    }
    enableShadows() {
        for (let mesh of this.redGoal)
            this.game.skybox.shadowGenerator.addShadowCaster(mesh);
        for (let mesh of this.blueGoal)
            this.game.skybox.shadowGenerator.addShadowCaster(mesh);
    }
    createField() {
        const field = BABYLON.MeshBuilder.CreateBox('field', { width: this.settings.width, height: 1, depth: this.settings.depth });
        field.position.y = -0.51;
        field.physicsImpostor = new BABYLON.PhysicsImpostor(field, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1, friction: 10 }, this.game.scene);
        field.checkCollisions = true;
        return field;
    }
    createUnder() {
        // const under = BABYLON.MeshBuilder.CreateDisc('under', { radius: this.settings.width })
        const under = BABYLON.MeshBuilder.CreateBox('under', { width: this.settings.width + this.settings.goalDepth * 2, height: 0.5, depth: this.settings.goalWidth });
        under.position.y = -0.51;
        under.physicsImpostor = new BABYLON.PhysicsImpostor(under, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 1, friction: 10 }, this.game.scene);
        under.checkCollisions = true;
        return under;
    }
    createLines() {
        const lines = [];
        const { width, depth, thickness } = this.settings;
        lines[0] = BABYLON.MeshBuilder.CreatePlane('line0', { width: thickness, height: depth });
        lines[0].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
        lines[0].setParent(this.field);
        lines[1] = BABYLON.MeshBuilder.CreateLathe('circle', {
            shape: [new BABYLON.Vector3(0.33, 0, 0), new BABYLON.Vector3(0.35, 0, 0)],
            radius: depth / 2,
            tessellation: 64
        });
        //TODO: Replace 0.33 with line thickness calculation
        lines[1].rotation = new BABYLON.Vector3(-Math.PI / 2 * 2, -Math.PI / 2, 0);
        lines[2] = BABYLON.MeshBuilder.CreatePlane('line1', { width: width, height: thickness });
        lines[2].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
        lines[2].position.z = depth / 2 - thickness / 2;
        lines[2].setParent(this.field);
        lines[3] = BABYLON.MeshBuilder.CreatePlane('line2', { width: width, height: thickness });
        lines[3].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
        lines[3].position.z = -depth / 2 + thickness / 2;
        lines[3].setParent(this.field);
        lines[4] = BABYLON.MeshBuilder.CreatePlane('line0', { width: thickness, height: depth });
        lines[4].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
        lines[4].position.x = -width / 2 + thickness / 2;
        lines[4].setParent(this.field);
        lines[5] = BABYLON.MeshBuilder.CreatePlane('line0', { width: thickness, height: depth });
        lines[5].rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
        lines[5].position.x = width / 2 - thickness / 2;
        lines[5].setParent(this.field);
        lines[6] = BABYLON.MeshBuilder.CreateDisc('central_point', { radius: thickness });
        lines[6].rotation = new BABYLON.Vector3(Math.PI / 2, 0, Math.PI / 2);
        lines[6].setParent(this.field);
        return lines;
    }
    createBorders() {
        const borders = [];
        const physics = { mass: 0, restitution: 1.5 };
        const { width, depth, borderHeight, borderTickness, goalWidth, goalHeight } = this.settings;
        //SIDES
        borders[0] = BABYLON.MeshBuilder.CreateBox('border1', { width: width, height: borderHeight, depth: borderTickness });
        borders[0].position = new BABYLON.Vector3(0, borderHeight / 2, depth / 2 + borderTickness / 2);
        borders[0].physicsImpostor = new BABYLON.PhysicsImpostor(borders[0], BABYLON.PhysicsImpostor.BoxImpostor, physics);
        borders[0].checkCollisions = true;
        borders[1] = BABYLON.MeshBuilder.CreateBox('border1', { width: width, height: borderHeight, depth: borderTickness });
        borders[1].position = new BABYLON.Vector3(0, borderHeight / 2, -depth / 2 - borderTickness / 2);
        borders[1].rotation.z = Math.PI;
        borders[1].physicsImpostor = new BABYLON.PhysicsImpostor(borders[1], BABYLON.PhysicsImpostor.BoxImpostor, physics);
        borders[1].checkCollisions = true;
        //GOAL EDGES
        borders[2] = BABYLON.MeshBuilder.CreateBox('border2', { width: (depth - goalWidth) / 2, height: borderHeight, depth: borderTickness });
        borders[2].position = new BABYLON.Vector3(-width / 2 - borderTickness / 2, borderHeight / 2, (-goalWidth / 2) - (depth - goalWidth) / 4);
        borders[2].rotation.y = Math.PI / 2;
        borders[2].rotation.z = Math.PI;
        borders[2].physicsImpostor = new BABYLON.PhysicsImpostor(borders[2], BABYLON.PhysicsImpostor.BoxImpostor, physics);
        borders[2].checkCollisions = true;
        borders[3] = BABYLON.MeshBuilder.CreateBox('border2', { width: (depth - goalWidth) / 2, height: borderHeight, depth: borderTickness });
        borders[3].position = new BABYLON.Vector3(-width / 2 - borderTickness / 2, borderHeight / 2, (goalWidth / 2) + (depth - goalWidth) / 4);
        borders[3].rotation.y = Math.PI / 2;
        borders[3].rotation.z = Math.PI;
        borders[3].physicsImpostor = new BABYLON.PhysicsImpostor(borders[3], BABYLON.PhysicsImpostor.BoxImpostor, physics);
        borders[3].checkCollisions = true;
        borders[4] = BABYLON.MeshBuilder.CreateBox('border2', { width: (depth - goalWidth) / 2, height: borderHeight, depth: borderTickness });
        borders[4].position = new BABYLON.Vector3(width / 2 + borderTickness / 2, borderHeight / 2, (goalWidth / 2) + (depth - goalWidth) / 4);
        borders[4].rotation.y = Math.PI / 2;
        borders[4].physicsImpostor = new BABYLON.PhysicsImpostor(borders[4], BABYLON.PhysicsImpostor.BoxImpostor, physics);
        borders[4].checkCollisions = true;
        borders[5] = BABYLON.MeshBuilder.CreateBox('border2', { width: (depth - goalWidth) / 2, height: borderHeight, depth: borderTickness });
        borders[5].position = new BABYLON.Vector3(width / 2 + borderTickness / 2, borderHeight / 2, (-goalWidth / 2) - (depth - goalWidth) / 4);
        borders[5].rotation.y = Math.PI / 2;
        borders[5].physicsImpostor = new BABYLON.PhysicsImpostor(borders[5], BABYLON.PhysicsImpostor.BoxImpostor, physics);
        borders[5].checkCollisions = true;
        return borders;
    }
    createGoals() {
        const { goalHeight, goalWidth, width, goalDepth } = this.settings;
        const diameter = 1.5;
        const goalMaterial = new BABYLON.StandardMaterial('goal', this.game.scene);
        goalMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        goalMaterial.ambientColor = new BABYLON.Color3(0, 0, 0);
        // goalMaterial.disableLighting = true
        const genGoal = (direction) => {
            const g = [];
            g[0] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalHeight + diameter, diameter: diameter, tessellation: 8 });
            g[0].position = new BABYLON.Vector3(direction * width / 2, goalHeight / 2 - 1, goalWidth / 2);
            g[0].physicsImpostor = new BABYLON.PhysicsImpostor(g[0], BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0 });
            g[0].checkCollisions = true; //POST
            g[1] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalHeight + diameter, diameter: diameter, tessellation: 8 });
            g[1].position = new BABYLON.Vector3(direction * width / 2, goalHeight / 2 - 1, -goalWidth / 2);
            g[1].physicsImpostor = new BABYLON.PhysicsImpostor(g[1], BABYLON.PhysicsImpostor.CylinderImpostor, { mass: 0 });
            g[1].checkCollisions = true; //POST
            g[2] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalWidth, diameter: diameter, tessellation: 8 });
            g[2].position = new BABYLON.Vector3(direction * width / 2, goalHeight - 1, 0);
            g[2].rotation.x = Math.PI / 2;
            g[2].checkCollisions = true; //CROSSBAR
            g[3] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalHeight + diameter, diameter: diameter / 2, tessellation: 8 });
            g[3].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth, goalHeight / 2 - 1, -goalWidth / 2);
            g[4] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalHeight + diameter, diameter: diameter / 2, tessellation: 8 });
            g[4].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth, goalHeight / 2 - 1, goalWidth / 2);
            g[5] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalDepth, diameter: diameter / 2, tessellation: 8 });
            g[5].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth / 2, goalHeight - 0.7, goalWidth / 2);
            g[5].rotation.z = Math.PI / 2;
            g[6] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalDepth, diameter: diameter / 2, tessellation: 8 });
            g[6].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth / 2, goalHeight - 0.7, -goalWidth / 2);
            g[6].rotation.z = Math.PI / 2;
            g[7] = BABYLON.MeshBuilder.CreateCylinder(`goal${direction}`, { height: goalWidth, diameter: diameter / 2, tessellation: 8 });
            g[7].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth, goalHeight - 0.7, 0);
            g[7].rotation.x = Math.PI / 2;
            for (let mesh of g)
                mesh.material = goalMaterial;
            g[8] = BABYLON.MeshBuilder.CreateBox(`goal${direction}`, { height: goalHeight, width: goalWidth, depth: 0.5 });
            g[8].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth, goalHeight / 2, 0);
            g[8].rotation.y = Math.PI / 2;
            g[8].checkCollisions = true;
            g[8].physicsImpostor = new BABYLON.PhysicsImpostor(g[8], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5 });
            g[9] = BABYLON.MeshBuilder.CreateBox(`goal${direction}`, { height: goalHeight, width: goalDepth, depth: 0.5 });
            g[9].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth / 2, goalHeight / 2, goalWidth / 2);
            g[9].checkCollisions = true;
            g[9].physicsImpostor = new BABYLON.PhysicsImpostor(g[9], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5 });
            g[10] = BABYLON.MeshBuilder.CreateBox(`goal${direction}`, { height: goalHeight, width: goalDepth, depth: 0.5 });
            g[10].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth / 2, goalHeight / 2, -goalWidth / 2);
            g[10].checkCollisions = true;
            g[10].physicsImpostor = new BABYLON.PhysicsImpostor(g[10], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5 });
            g[11] = BABYLON.MeshBuilder.CreateBox(`goal${direction}`, { height: goalDepth, width: goalWidth, depth: 0.5 });
            g[11].position = new BABYLON.Vector3(direction * width / 2 + direction * goalDepth / 2, goalHeight - 0.7, 0);
            g[11].rotation.y = Math.PI / 2;
            g[11].rotation.x = Math.PI / 2;
            g[11].checkCollisions = true;
            g[11].physicsImpostor = new BABYLON.PhysicsImpostor(g[11], BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5 });
            return g;
        };
        this.redGoal = genGoal(1);
        this.blueGoal = genGoal(-1);
        this.redGoalZone = BABYLON.MeshBuilder.CreateBox('redGoalZone', {
            width: goalDepth, height: goalHeight - 3, depth: goalWidth - 3, sideOrientation: BABYLON.Mesh.BACKSIDE
        });
        this.redGoalZone.isVisible = false;
        this.redGoalZone.position = new BABYLON.Vector3(width / 2 + (goalDepth / 2 + 3), goalHeight / 2 - 1, 0);
        this.blueGoalZone = BABYLON.MeshBuilder.CreateBox('blueGoalZone', {
            width: goalDepth, height: goalHeight - 3, depth: goalWidth - 3, sideOrientation: BABYLON.Mesh.BACKSIDE
        });
        this.blueGoalZone.isVisible = false;
        this.blueGoalZone.position = new BABYLON.Vector3(-width / 2 - (goalDepth / 2 + 3), goalHeight / 2 - 1, 0);
    }
    createLights() {
        const { width, depth } = this.settings;
        const lights = [];
        const genLight = (p) => {
            const l = new BABYLON.PointLight('fLight', p, this.game.scene);
            l.intensity = 0;
            gsap_1.default.to(l, { intensity: 3, duration: 15, delay: lights.length * 0.5, });
            return l;
        };
        lights[0] = genLight(new BABYLON.Vector3(width / 2, 5, depth / 2));
        lights[1] = genLight(new BABYLON.Vector3(-width / 2, 5, depth / 2));
        lights[2] = genLight(new BABYLON.Vector3(width / 2, 5, -depth / 2));
        lights[3] = genLight(new BABYLON.Vector3(-width / 2, 5, -depth / 2));
        return lights;
    }
    applyTextures() {
        //#region The pitch
        const grass = new BABYLON.StandardMaterial("grass", this.game.scene);
        grass.specularColor = new BABYLON.Color3(0, 0, 0);
        const t1 = new BABYLON.Texture("assets/textures/pitch2.png", this.game.scene);
        t1.uScale = 6;
        t1.vScale = 8;
        grass.ambientTexture = t1;
        grass.maxSimultaneousLights = 8;
        this.field.material = grass;
        this.field.receiveShadows = true;
        //#endregion
        //#region Under the pitch
        const under = new BABYLON.StandardMaterial("under", this.game.scene);
        under.specularColor = new BABYLON.Color3(0, 0, 0);
        const t2 = new BABYLON.Texture("assets/textures/sand.jpg", this.game.scene);
        t2.uScale = 6;
        t2.vScale = 8;
        under.ambientTexture = t2;
        under.maxSimultaneousLights = 8;
        this.under.material = under;
        this.under.receiveShadows = true;
        //#endregion
        //#region Borders
        const material = new BABYLON.StandardMaterial("borders", this.game.scene);
        material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 1);
        material.alpha = 0.1;
        this.borders[5].material = material;
        this.borders[4].material = material;
        this.borders[3].material = material;
        this.borders[2].material = material;
        this.borders[1].material = material;
        this.borders[0].material = material;
        //#endregion
        //#region Net material
        const netMaterial = new BABYLON.StandardMaterial("net", this.game.scene);
        netMaterial.useAlphaFromDiffuseTexture = true;
        const texture = new BABYLON.Texture("assets/textures/borders.png", this.game.scene);
        texture.uScale = 1;
        texture.vScale = 3;
        texture.hasAlpha = true;
        netMaterial.diffuseTexture = texture;
        netMaterial.emissiveTexture = texture;
        netMaterial.alpha = 0.5;
        const setNetMaterial = (mesh) => {
            if (!mesh.material) {
                const size = mesh.getBoundingInfo().boundingBox.extendSize;
                mesh.material = netMaterial;
                uv_1.setUVScale(mesh, size.x / 4, size.y / 8);
            }
        };
        for (let mesh of this.redGoal)
            setNetMaterial(mesh);
        for (let mesh of this.blueGoal)
            setNetMaterial(mesh);
        netMaterial.disableLighting = true;
        //#endregion
    }
}
exports.SoccerWorld = SoccerWorld;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/player/camera.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PlayerCamera = void 0;
const tslib_1 = __webpack_require__("tslib");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
class PlayerCamera {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.camHeight = 10;
        this.camDistance = 80;
        this.camera = new BABYLON.FreeCamera('pCam', new BABYLON.Vector3(this.camDistance, this.camHeight, 0), this.game.scene);
        this.camera.fov = 0.6;
        this.direction = new BABYLON.Vector3(0, 0, 0);
    }
    update(dt) {
        // this.camera.target = this.player.collider.position
        const targetPosition = this.player.collider.position.add(new BABYLON.Vector3(this.camDistance, this.camHeight, 0));
        this.camera.position = this.camera.position.add(new BABYLON.Vector3(((this.player.collider.position.x) + 80 - this.camera.position.x) * dt / 500, ((this.player.collider.position.y) + 40 - this.camera.position.y) * dt / 500, (this.player.collider.position.z - this.camera.position.z) * dt / 500));
        this.camera.target = this.player.collider.position;
        this.direction = targetPosition.subtract(this.player.collider.position).multiplyByFloats(1, 0, 1).normalize();
    }
    destroy() {
        this.camera.dispose();
    }
}
exports.PlayerCamera = PlayerCamera;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/player/nameplate.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PlayerNameplate = void 0;
const tslib_1 = __webpack_require__("tslib");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
const GUI = tslib_1.__importStar(__webpack_require__("babylonjs-gui"));
class PlayerNameplate {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.nameplatePlane = BABYLON.MeshBuilder.CreatePlane('nameplate', { width: 10, height: 10 }, this.game.scene);
        this.nameplatePlane.parent = this.player.collider;
        this.nameplatePlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        this.nameplatePlane.locallyTranslate(new BABYLON.Vector3(0, 4, 0));
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(this.nameplatePlane);
        this.nameplate = new GUI.TextBlock();
        this.nameplate.text = 'Jabu';
        this.nameplate.shadowBlur = 10;
        this.nameplate.fontSizeInPixels = 60;
        this.nameplate.fontWeight = 'bold';
        this.nameplate.color = '#ffffffff';
        this.advancedTexture.addControl(this.nameplate);
    }
}
exports.PlayerNameplate = PlayerNameplate;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/player/player.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BasePlayer = void 0;
const tslib_1 = __webpack_require__("tslib");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
const render_1 = __webpack_require__("./libs/game-lib/src/lib/src/player/render.ts");
const camera_1 = __webpack_require__("./libs/game-lib/src/lib/src/player/camera.ts");
const nameplate_1 = __webpack_require__("./libs/game-lib/src/lib/src/player/nameplate.ts");
class BasePlayer {
    constructor(game) {
        this.game = game;
        this.inputs = {};
        this.acceleration = new BABYLON.Vector3(0, 0, 0);
        this.velocity = new BABYLON.Vector3(0, 0, 0);
        this.gravityVelocity = new BABYLON.Vector3(0, 0, 0);
        this.realGravityVelocity = new BABYLON.Vector3(0, 0, 0);
        this.deltaSpeed = 180;
        this.sprintDeltaSpeed = 120;
        this.loopCall = this.loop.bind(this);
        this.init();
    }
    destroy() {
        var _a;
        this.game.scene.unregisterBeforeRender(this.loopCall);
        (_a = this.collider) === null || _a === void 0 ? void 0 : _a.dispose();
        if (this.renderer)
            this.renderer.destroy();
        this.camera.destroy();
    }
    init() {
        this.collider = BABYLON.MeshBuilder.CreateBox('player_collider', { width: 2.5, height: 4, depth: 1.7 }, this.game.scene);
        this.collider.ellipsoid = new BABYLON.Vector3(1, 2, 0.7);
        this.collider.isVisible = false;
        this.collider.checkCollisions = true;
        this.collider.physicsImpostor = new BABYLON.PhysicsImpostor(this.collider, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 2 });
        if (this.game.canvas) {
            this.game.skybox.shadowGenerator.addShadowCaster(this.collider);
            this.renderer = new render_1.PlayerRenderer(this.game, this);
            this.nameplate = new nameplate_1.PlayerNameplate(this.game, this);
        }
        this.game.scene.registerBeforeRender(this.loopCall);
        this.camera = new camera_1.PlayerCamera(this.game, this);
    }
    loop() {
        var _a;
        const dt = this.game.engine.getDeltaTime();
        const initialPosition = this.collider.position.clone();
        if (this.id === 'SELF' || this.id === this.game.selfId) {
            this.inputs = ((_a = this.game.input) === null || _a === void 0 ? void 0 : _a.getInputs()) || {};
        }
        const X = (this.inputs['UP'] || 0) * -1 + (this.inputs['DOWN'] || 0) * 1;
        const Z = (this.inputs['RIGHT'] || 0) * 1 + (this.inputs['LEFT'] || 0) * -1;
        this.acceleration = new BABYLON.Vector3(X, 0, Z);
        if (this.acceleration.length() > 1)
            this.acceleration = this.acceleration.normalize();
        if (this.inputs['RIGHT_TRIGGER'])
            this.acceleration = this.acceleration.scaleInPlace(dt / this.sprintDeltaSpeed);
        else
            this.acceleration = this.acceleration.scaleInPlace(dt / this.deltaSpeed);
        this.velocity = this.velocity.add(this.acceleration);
        if (this.velocity.length() > 0.001)
            this.collider.lookAt(this.collider.position.subtract(this.velocity));
        if (this.inputs['A'] && this.realGravityVelocity.y === 0) {
            this.realGravityVelocity.y = 0.4;
        }
        //GRAVITY
        this.gravityVelocity = new BABYLON.Vector3(0, this.realGravityVelocity.y - 0.01, 0);
        this.collider.moveWithCollisions(this.velocity);
        this.collider.moveWithCollisions(this.gravityVelocity);
        if (this.renderer)
            this.renderer.render(dt);
        this.camera.update(dt);
        this.realGravityVelocity = this.collider.position.subtract(initialPosition).maximizeInPlaceFromFloats(0, -2, 0).scaleInPlace(0.99);
        this.velocity = this.velocity.scaleInPlace(0.85);
        // this.gravityVelocity = this.gravityVelocity.scaleInPlace(0.80)
        if (this.serverPosition) {
            const distance = this.serverPosition.subtract(this.collider.position);
            this.collider.position = this.collider.position.add(distance.scale(0.1));
        }
    }
    setSelf() {
        this.game.scene.switchActiveCamera(this.camera.camera);
    }
    setId(id) {
        this.id = id;
        console.debug(this.id, this.game.selfId);
        if (this.id === this.game.selfId || this.id === 'SELF')
            this.game.scene.switchActiveCamera(this.camera.camera);
    }
    setPseudo(pseudo) {
        this.pseudo = pseudo;
    }
}
exports.BasePlayer = BasePlayer;


/***/ }),

/***/ "./libs/game-lib/src/lib/src/player/render.ts":
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PlayerRenderer = void 0;
const tslib_1 = __webpack_require__("tslib");
const BABYLON = tslib_1.__importStar(__webpack_require__("babylonjs"));
__webpack_require__("babylonjs-loaders");
const smoothAnimations_1 = __webpack_require__("./libs/game-lib/src/lib/src/misc/smoothAnimations.ts");
class PlayerRenderer {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.animations = [];
        BABYLON.SceneLoader.ImportMeshAsync("", "assets/", "pingu.glb", this.game.scene).then(mesh => {
            this.mesh = mesh.meshes[0];
            this.mesh.parent = this.player.collider;
            this.mesh.scaling = new BABYLON.Vector3(1, 1, 1);
            this.mesh.locallyTranslate(new BABYLON.Vector3(0, -2, 0));
            this.game.skybox.shadowGenerator.addShadowCaster(this.mesh);
            this.animations = mesh.animationGroups;
            this.animatables = new smoothAnimations_1.SmoothAnimation(this.game, this.animations);
            this.HEAD = this.mesh.getChildTransformNodes().find(t => t.name === 'HEAD');
        });
    }
    render(dt) {
        var _a;
        this.animate(dt);
        (_a = this.animatables) === null || _a === void 0 ? void 0 : _a.loop();
        if (this.lookAt && this.HEAD) {
            this.HEAD.lookAt(this.lookAt.position, -Math.PI / 2, 0, 0, BABYLON.Space.WORLD);
            if (this.HEAD.rotationQuaternion.y > 0.5)
                this.HEAD.rotationQuaternion.y = 0;
            this.HEAD.rotationQuaternion.z = 0;
            this.HEAD.rotationQuaternion.x = 0;
        }
    }
    animate(dt) {
        if (Math.abs(this.player.realGravityVelocity.y) > 0.10)
            this.playAnimation('FALLING');
        else if (this.player.velocity.length() > 0.32)
            this.playAnimation('SPRINT', this.player.velocity.length() * dt / 2);
        else if (this.player.velocity.length() > 0.01)
            this.playAnimation('RUN', this.player.velocity.length() * dt / 2);
        else
            this.playAnimation('IDLE');
    }
    playAnimation(name, speed) {
        if (this.animatables)
            this.animatables.play(name, speed);
    }
    destroy() {
        var _a;
        for (let animation of this.animations)
            animation.dispose();
        (_a = this.mesh) === null || _a === void 0 ? void 0 : _a.dispose();
    }
}
exports.PlayerRenderer = PlayerRenderer;


/***/ }),

/***/ "ammo.js":
/***/ ((module) => {

module.exports = require("ammo.js");

/***/ }),

/***/ "babylonjs":
/***/ ((module) => {

module.exports = require("babylonjs");

/***/ }),

/***/ "babylonjs-gui":
/***/ ((module) => {

module.exports = require("babylonjs-gui");

/***/ }),

/***/ "babylonjs-loaders":
/***/ ((module) => {

module.exports = require("babylonjs-loaders");

/***/ }),

/***/ "cookie-parser":
/***/ ((module) => {

module.exports = require("cookie-parser");

/***/ }),

/***/ "dayjs":
/***/ ((module) => {

module.exports = require("dayjs");

/***/ }),

/***/ "dayjs/plugin/duration":
/***/ ((module) => {

module.exports = require("dayjs/plugin/duration");

/***/ }),

/***/ "express":
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "gsap":
/***/ ((module) => {

module.exports = require("gsap");

/***/ }),

/***/ "path":
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "rxjs":
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),

/***/ "socket.io":
/***/ ((module) => {

module.exports = require("socket.io");

/***/ }),

/***/ "tslib":
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),

/***/ "http":
/***/ ((module) => {

module.exports = require("http");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./apps/api/src/main.ts");
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.js.map