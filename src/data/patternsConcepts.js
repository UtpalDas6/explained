import Singleton from '../concepts/patterns/Singleton.jsx'
import FactoryMethod from '../concepts/patterns/FactoryMethod.jsx'
import AbstractFactory from '../concepts/patterns/AbstractFactory.jsx'
import Builder from '../concepts/patterns/Builder.jsx'
import Prototype from '../concepts/patterns/Prototype.jsx'
import Adapter from '../concepts/patterns/Adapter.jsx'
import Bridge from '../concepts/patterns/Bridge.jsx'
import Composite from '../concepts/patterns/Composite.jsx'
import Decorator from '../concepts/patterns/Decorator.jsx'
import Facade from '../concepts/patterns/Facade.jsx'
import Flyweight from '../concepts/patterns/Flyweight.jsx'
import Proxy from '../concepts/patterns/Proxy.jsx'
import ChainOfResponsibility from '../concepts/patterns/ChainOfResponsibility.jsx'
import Command from '../concepts/patterns/Command.jsx'
import Interpreter from '../concepts/patterns/Interpreter.jsx'
import Iterator from '../concepts/patterns/Iterator.jsx'
import Mediator from '../concepts/patterns/Mediator.jsx'
import Memento from '../concepts/patterns/Memento.jsx'
import Observer from '../concepts/patterns/Observer.jsx'
import StatePattern from '../concepts/patterns/State.jsx'
import Strategy from '../concepts/patterns/Strategy.jsx'
import TemplateMethod from '../concepts/patterns/TemplateMethod.jsx'
import Visitor from '../concepts/patterns/Visitor.jsx'

// Registry for the /patterns section — the 23 classic Gang-of-Four design
// patterns, grouped Creational / Structural / Behavioral (used as the `tag`).
// Same shape as data/concepts.js: single `code` snippet + `realWorld`.
export const patternsConcepts = [
  {
    id: 'singleton',
    section: 'patterns',
    title: 'Singleton',
    blurb: 'Guarantees a class has exactly one instance and gives every caller the same one.',
    tag: 'Creational',
    Component: Singleton,
    code: [
      {
        lang: 'js',
        snippet: `class Config {
  static #instance

  static getInstance() {
    if (!Config.#instance) Config.#instance = new Config()
    return Config.#instance
  }
}

const a = Config.getInstance()
const b = Config.getInstance()
a === b // true`,
      },
      {
        lang: 'python',
        snippet: `class Config:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

a = Config.get_instance()
b = Config.get_instance()
a is b  # True`,
      },
    ],
    realWorld:
      'App-wide config objects, database connection pools, and loggers — anywhere creating a second instance would be wasteful or actively wrong. Overused it becomes global mutable state that makes tests order-dependent, so reach for dependency injection first if testability matters.',
    pitfall:
      'Overusing it turns into global mutable state that makes unit tests order-dependent and hides a class\'s dependencies — most "must be one instance" cases are better served by a single instance passed in (dependency injection) than enforced by the class itself.',
    fix:
      'Prefer constructing one instance at startup and passing it in via dependency injection — that gives every consumer the same object without a static/global hard-coding the "only one" rule into the class itself.',
  },
  {
    id: 'factory-method',
    section: 'patterns',
    title: 'Factory Method',
    blurb: 'Lets a class defer instantiation to subclasses instead of calling `new` directly.',
    tag: 'Creational',
    Component: FactoryMethod,
    code: [
      {
        lang: 'js',
        snippet: `class ShapeFactory {
  static create(kind) {
    switch (kind) {
      case 'circle': return new Circle()
      case 'square': return new Square()
      default: throw new Error(\`unknown shape: \${kind}\`)
    }
  }
}

const shape = ShapeFactory.create('circle')`,
      },
      {
        lang: 'python',
        snippet: `class ShapeFactory:
    @staticmethod
    def create(kind):
        if kind == 'circle':
            return Circle()
        if kind == 'square':
            return Square()
        raise ValueError(f'unknown shape: {kind}')

shape = ShapeFactory.create('circle')`,
      },
    ],
    realWorld:
      'Any SDK with `Document.createElement(tag)`- or `driver.createConnection()`-style APIs — the caller names what it wants and the library picks the concrete class. Keeps `new SomeConcreteClass()` calls out of business logic so a new subtype can be added in one place.',
    pitfall:
      'Adds a layer of indirection for what\'s sometimes just a `new` call — it earns its keep once there\'s actually more than one concrete type to choose between, not preemptively for a class with a single implementation.',
    fix:
      'Start with a direct constructor call; introduce the factory only once a second concrete type actually shows up — refactoring to add it later is a small, mechanical change.',
  },
  {
    id: 'abstract-factory',
    section: 'patterns',
    title: 'Abstract Factory',
    blurb: 'Produces families of related objects together, so they never end up mismatched.',
    tag: 'Creational',
    Component: AbstractFactory,
    code: [
      {
        lang: 'js',
        snippet: `const lightFactory = { createButton: () => new LightButton(), createCheckbox: () => new LightCheckbox() }
const darkFactory = { createButton: () => new DarkButton(), createCheckbox: () => new DarkCheckbox() }

function renderUI(factory) {
  return [factory.createButton(), factory.createCheckbox()]
}

renderUI(darkFactory) // both widgets guaranteed to match the dark theme`,
      },
      {
        lang: 'python',
        snippet: `light_factory = {'button': LightButton, 'checkbox': LightCheckbox}
dark_factory = {'button': DarkButton, 'checkbox': DarkCheckbox}

def render_ui(factory):
    return [factory['button'](), factory['checkbox']()]

render_ui(dark_factory)  # both widgets guaranteed to match the dark theme`,
      },
    ],
    realWorld:
      'Cross-platform UI toolkits (a Mac widget factory vs a Windows widget factory) and theme systems — one factory swap changes every produced widget consistently, instead of every call site independently checking "is this dark mode?"',
    pitfall:
      'Adding a new *product* (not a new family) means touching every existing factory implementation — it optimizes for new families, not new product types, so picking it backwards makes every future change ripple across factories.',
    fix:
      'If new product types are more likely to appear than new families, favor a simpler factory method (or dependency injection) per product instead — reserve abstract factory for when families are the axis that changes.',
  },
  {
    id: 'builder',
    section: 'patterns',
    title: 'Builder',
    blurb: 'Assembles a complex object step by step, separating construction from what it ends up containing.',
    tag: 'Creational',
    Component: Builder,
    code: [
      {
        lang: 'js',
        snippet: `class BurgerBuilder {
  #parts = []
  add(part) { this.#parts.push(part); return this }
  build() { return { parts: this.#parts } }
}

const burger = new BurgerBuilder().add('bun').add('patty').add('cheese').build()`,
      },
      {
        lang: 'python',
        snippet: `class BurgerBuilder:
    def __init__(self):
        self.parts = []

    def add(self, part):
        self.parts.append(part)
        return self

    def build(self):
        return {'parts': self.parts}

burger = BurgerBuilder().add('bun').add('patty').add('cheese').build()`,
      },
    ],
    realWorld:
      'Query builders (SQL, Elasticsearch), HTTP request builders, and any constructor that would otherwise need a dozen optional parameters — chainable `.add()`/`.with()` calls read cleanly and only `.build()` at the end has to know how to assemble the final object.',
    pitfall:
      'For an object with two or three fields, a builder is pure ceremony — it earns its keep once the constructor would otherwise need five-plus optional parameters.',
    fix:
      'Use plain named or optional constructor parameters (or an options object) until the parameter list genuinely gets unwieldy — introduce the builder once that threshold is actually hit.',
  },
  {
    id: 'prototype',
    section: 'patterns',
    title: 'Prototype',
    blurb: 'Creates new objects by copying an existing one instead of constructing from scratch.',
    tag: 'Creational',
    Component: Prototype,
    code: [
      {
        lang: 'js',
        snippet: `const orcPrototype = { hp: 80, armor: 12, weapon: 'sword' }

function spawn(prototype, overrides = {}) {
  return { ...prototype, ...overrides }
}

const orc2 = spawn(orcPrototype, { weapon: 'axe' })`,
      },
      {
        lang: 'python',
        snippet: `import copy

orc_prototype = {'hp': 80, 'armor': 12, 'weapon': 'sword'}

def spawn(prototype, **overrides):
    clone = copy.deepcopy(prototype)
    clone.update(overrides)
    return clone

orc2 = spawn(orc_prototype, weapon='axe')`,
      },
    ],
    realWorld:
      'Game engines spawning many similar enemies from one configured template, and `structuredClone`/`Object.create(proto)` in JS itself — cloning a pre-built object is cheaper than re-running an expensive constructor or re-fetching config for every new instance.',
    pitfall:
      'A shallow clone silently shares nested objects and arrays with the original — mutating a "cloned" nested field mutates the original too, unless the clone is deliberately deep.',
    fix:
      'Deep-clone explicitly (`structuredClone` in JS, `copy.deepcopy` in Python) whenever the object has nested mutable structures, or make the prototype itself immutable so shallow copies can\'t cause aliasing bugs.',
  },
  {
    id: 'adapter',
    section: 'patterns',
    title: 'Adapter',
    blurb: "Wraps an incompatible interface so it fits the one a client already expects.",
    tag: 'Structural',
    Component: Adapter,
    code: [
      {
        lang: 'js',
        snippet: `// legacyLogger.write(level, msg) — but our app expects logger.log(msg)
class LoggerAdapter {
  #legacy
  constructor(legacyLogger) { this.#legacy = legacyLogger }
  log(msg) { this.#legacy.write('INFO', msg) }
}

const logger = new LoggerAdapter(legacyLogger)`,
      },
      {
        lang: 'python',
        snippet: `# legacy_logger.write(level, msg) — but our app expects logger.log(msg)
class LoggerAdapter:
    def __init__(self, legacy_logger):
        self._legacy = legacy_logger

    def log(self, msg):
        self._legacy.write('INFO', msg)

logger = LoggerAdapter(legacy_logger)`,
      },
    ],
    realWorld:
      'Wrapping a third-party SDK or a legacy module so it matches an interface your app already codes against — the classic case is swapping payment providers (Stripe vs PayPal) behind one `charge(amount)` method the rest of the app calls.',
    pitfall:
      'An adapter that has to do real work to bridge mismatched semantics (not just rename methods) is a sign the two interfaces don\'t actually line up — sometimes that mismatch is worth fixing upstream instead of papering over.',
    fix:
      'If the adapter is translating fundamentally different behavior — not just method names — consider whether the underlying dependency should be replaced instead of permanently wrapped.',
  },
  {
    id: 'bridge',
    section: 'patterns',
    title: 'Bridge',
    blurb: 'Splits an abstraction and its implementation into two hierarchies that vary independently.',
    tag: 'Structural',
    Component: Bridge,
    code: [
      {
        lang: 'js',
        snippet: `class Shape {
  constructor(renderer) { this.renderer = renderer }
}
class Circle extends Shape {
  draw() { return this.renderer.renderCircle() }
}

const circle = new Circle(new VectorRenderer())`,
      },
      {
        lang: 'python',
        snippet: `class Shape:
    def __init__(self, renderer):
        self.renderer = renderer

class Circle(Shape):
    def draw(self):
        return self.renderer.render_circle()

circle = Circle(VectorRenderer())`,
      },
    ],
    realWorld:
      "Cross-platform GUI frameworks (a Window abstraction bridged to per-OS implementations) and driver-style APIs — avoids the class explosion you'd get from subclassing every shape × every renderer combination directly.",
    pitfall:
      'It\'s easy to introduce this abstraction before there are actually two independent hierarchies that vary — with only one implementation ever built, it\'s just an extra indirection with no payoff yet.',
    fix:
      'Wait until a second independent implementation actually exists before introducing the bridge — refactor a single concrete class into the split abstraction/implementation only once that second variant is real.',
  },
  {
    id: 'composite',
    section: 'patterns',
    title: 'Composite',
    blurb: 'Composes objects into tree structures, so clients treat a single item and a group identically.',
    tag: 'Structural',
    Component: Composite,
    code: [
      {
        lang: 'js',
        snippet: `class File { constructor(size) { this.size = size } getSize() { return this.size } }
class Folder {
  #children = []
  add(child) { this.#children.push(child) }
  getSize() { return this.#children.reduce((sum, c) => sum + c.getSize(), 0) }
}

root.getSize() // recurses through every nested folder automatically`,
      },
      {
        lang: 'python',
        snippet: `class File:
    def __init__(self, size):
        self.size = size

    def get_size(self):
        return self.size

class Folder:
    def __init__(self):
        self.children = []

    def add(self, child):
        self.children.append(child)

    def get_size(self):
        return sum(c.get_size() for c in self.children)

root.get_size()  # recurses through every nested folder automatically`,
      },
    ],
    realWorld:
      'Filesystem trees, DOM nodes, and UI component trees — any "container that can hold more containers" needs a single method that works the same whether it\'s called on one leaf or an entire subtree.',
    pitfall:
      'Treating a leaf and a composite identically only works cleanly if every operation makes sense on both — an operation that\'s meaningless on a leaf (like "add child") forces an awkward no-op or an exception.',
    fix:
      'Give the leaf a sensible default (a no-op `add()` that throws or silently ignores) and document that leaves are terminal, or split the interface so only composite nodes expose child-management methods.',
  },
  {
    id: 'decorator',
    section: 'patterns',
    title: 'Decorator',
    blurb: 'Wraps an object to add behavior at runtime without subclassing every combination.',
    tag: 'Structural',
    Component: Decorator,
    code: [
      {
        lang: 'js',
        snippet: `function withMilk(coffee) {
  return { cost: () => coffee.cost() + 0.5, describe: () => coffee.describe() + ' + milk' }
}

let order = { cost: () => 2, describe: () => 'coffee' }
order = withMilk(order)
order = withSugar(order)
order.cost() // stacks each wrapper's addition`,
      },
      {
        lang: 'python',
        snippet: `def with_milk(coffee):
    return {'cost': lambda: coffee['cost']() + 0.5, 'describe': lambda: coffee['describe']() + ' + milk'}

order = {'cost': lambda: 2, 'describe': lambda: 'coffee'}
order = with_milk(order)
order = with_sugar(order)
order['cost']()  # stacks each wrapper's addition`,
      },
    ],
    realWorld:
      "Express/Koa middleware, React higher-order components, and Java's `BufferedInputStream(new FileInputStream(...))`-style stream wrapping — each layer adds one capability and forwards to the one it wraps.",
    pitfall:
      'Stacking many decorators makes debugging painful — the runtime object is now N layers of wrapping, and a stack trace through it is noisier than a single class with an if/else would be.',
    fix:
      'Keep the decorator chain shallow and name each wrapper clearly (or log which decorators are active) so a stack trace through several layers is still traceable back to the source.',
  },
  {
    id: 'facade',
    section: 'patterns',
    title: 'Facade',
    blurb: 'Gives a simple, unified entry point to a set of complex subsystem calls.',
    tag: 'Structural',
    Component: Facade,
    code: [
      {
        lang: 'js',
        snippet: `class HomeTheaterFacade {
  constructor(amp, projector, lights, dvd) { Object.assign(this, { amp, projector, lights, dvd }) }
  watchMovie() {
    this.amp.on(); this.projector.on(); this.lights.dim(20); this.dvd.play()
  }
}

new HomeTheaterFacade(amp, projector, lights, dvd).watchMovie()`,
      },
      {
        lang: 'python',
        snippet: `class HomeTheaterFacade:
    def __init__(self, amp, projector, lights, dvd):
        self.amp, self.projector, self.lights, self.dvd = amp, projector, lights, dvd

    def watch_movie(self):
        self.amp.on(); self.projector.on(); self.lights.dim(20); self.dvd.play()

HomeTheaterFacade(amp, projector, lights, dvd).watch_movie()`,
      },
    ],
    realWorld:
      "SDK entry points like `stripe.charges.create()` that hide dozens of internal API calls, and a `Database` class exposing `.query()` while hiding connection pooling, retries, and query building underneath.",
    pitfall:
      'A facade that just forwards one-to-one to subsystem calls without actually simplifying anything is dead weight — it should hide real complexity, not just rename it.',
    fix:
      'Only add a facade method when it\'s actually collapsing multiple calls or hiding real sequencing/configuration — if it\'s a 1:1 passthrough, just expose the subsystem directly instead.',
  },
  {
    id: 'flyweight',
    section: 'patterns',
    title: 'Flyweight',
    blurb: 'Shares a small pool of common (intrinsic) state across many objects that each only carry unique (extrinsic) state.',
    tag: 'Structural',
    Component: Flyweight,
    code: [
      {
        lang: 'js',
        snippet: `const treeTypes = new Map()
function getTreeType(species) {
  if (!treeTypes.has(species)) treeTypes.set(species, { species, mesh: loadMesh(species) })
  return treeTypes.get(species)
}

// 100,000 trees, only a couple of shared TreeType objects
const trees = positions.map((pos) => ({ pos, type: getTreeType('oak') }))`,
      },
      {
        lang: 'python',
        snippet: `tree_types = {}
def get_tree_type(species):
    if species not in tree_types:
        tree_types[species] = {'species': species, 'mesh': load_mesh(species)}
    return tree_types[species]

# 100,000 trees, only a couple of shared TreeType objects
trees = [{'pos': pos, 'type': get_tree_type('oak')} for pos in positions]`,
      },
    ],
    realWorld:
      'Rendering a forest or a crowd (shared mesh/texture per type, unique transform per instance), and string interning — anywhere object count is huge but the distinct "kinds" of object are few.',
    pitfall:
      'Splitting state into intrinsic (shared) and extrinsic (per-instance) adds real complexity — only worth it once you\'ve actually measured that raw object count is a memory problem, not preemptively.',
    fix:
      'Profile actual memory usage first — only split state into intrinsic and extrinsic once object count is measured to be a real bottleneck, not as a starting design choice.',
  },
  {
    id: 'proxy',
    section: 'patterns',
    title: 'Proxy',
    blurb: 'Stands in for another object to control access to it — lazy loading, caching, or permission checks.',
    tag: 'Structural',
    Component: Proxy,
    code: [
      {
        lang: 'js',
        snippet: `class ImageProxy {
  #real
  constructor(url) { this.url = url }
  render() {
    this.#real ??= new RealImage(this.url) // loads only on first render
    return this.#real.render()
  }
}`,
      },
      {
        lang: 'python',
        snippet: `class ImageProxy:
    def __init__(self, url):
        self.url = url
        self._real = None

    def render(self):
        if self._real is None:
            self._real = RealImage(self.url)  # loads only on first render
        return self._real.render()`,
      },
    ],
    realWorld:
      "JS's own `Proxy` object for intercepting property access, lazy-loaded images, and ORMs returning a lightweight proxy that only hits the database when a related field is actually touched.",
    pitfall:
      'A caching proxy that never invalidates silently serves stale data forever — it needs the same cache-invalidation discipline as any other cache, not a free pass because it\'s "just a proxy."',
    fix:
      'Give the proxy\'s cache the same TTL or explicit-invalidation strategy you\'d use for any other cache — never let "it\'s a proxy" be an excuse to skip invalidation.',
  },
  {
    id: 'chain-of-responsibility',
    section: 'patterns',
    title: 'Chain of Responsibility',
    blurb: 'Passes a request along a chain of handlers until one of them handles it.',
    tag: 'Behavioral',
    Component: ChainOfResponsibility,
    code: [
      {
        lang: 'js',
        snippet: `class Approver {
  constructor(limit, next) { this.limit = limit; this.next = next }
  approve(amount) {
    if (amount <= this.limit) return this.constructor.name
    if (this.next) return this.next.approve(amount)
    throw new Error('no approver found')
  }
}

const chain = new Manager(100, new Director(1000, new VP(10000)))`,
      },
      {
        lang: 'python',
        snippet: `class Approver:
    def __init__(self, limit, next=None):
        self.limit = limit
        self.next = next

    def approve(self, amount):
        if amount <= self.limit:
            return type(self).__name__
        if self.next:
            return self.next.approve(amount)
        raise ValueError('no approver found')

chain = Manager(100, Director(1000, VP(10000)))`,
      },
    ],
    realWorld:
      'Middleware pipelines (Express, servlet filters) and approval workflows — each handler only decides "can I handle this?" and forwards otherwise, so the caller never needs to know the full chain.',
    pitfall:
      'If no handler in the chain claims the request, it just disappears (or throws) with no obvious owner — always design an explicit fallback/default handler at the end of the chain.',
    fix:
      'Add a terminal default handler at the end of the chain that explicitly handles (or logs and rejects) anything none of the earlier handlers claimed, instead of letting it silently vanish.',
  },
  {
    id: 'command',
    section: 'patterns',
    title: 'Command',
    blurb: 'Turns a request into a standalone object, so it can be queued, logged, or undone.',
    tag: 'Behavioral',
    Component: Command,
    code: [
      {
        lang: 'js',
        snippet: `class MoveCommand {
  constructor(entity, dx, dy) { Object.assign(this, { entity, dx, dy }) }
  execute() { this.entity.x += this.dx; this.entity.y += this.dy }
  undo() { this.entity.x -= this.dx; this.entity.y -= this.dy }
}

const history = []
function run(cmd) { cmd.execute(); history.push(cmd) }
function undoLast() { history.pop()?.undo() }`,
      },
      {
        lang: 'python',
        snippet: `class MoveCommand:
    def __init__(self, entity, dx, dy):
        self.entity, self.dx, self.dy = entity, dx, dy

    def execute(self):
        self.entity.x += self.dx; self.entity.y += self.dy

    def undo(self):
        self.entity.x -= self.dx; self.entity.y -= self.dy

history = []
def run(cmd):
    cmd.execute()
    history.append(cmd)

def undo_last():
    if history:
        history.pop().undo()`,
      },
    ],
    realWorld:
      'Undo/redo stacks in editors, GUI button click handlers, and task queues — wrapping "what to do" as data instead of a direct function call is what makes replaying, logging, or reversing an action possible.',
    pitfall:
      'Wrapping every trivial action as a command object "for future flexibility" is overkill — it earns its keep specifically when you need undo, queuing, or logging, not for a plain button click.',
    fix:
      'Reach for command objects specifically when you need undo, queuing, replay, or logging — call the function directly for anything that\'s fired once and forgotten.',
  },
  {
    id: 'interpreter',
    section: 'patterns',
    title: 'Interpreter',
    blurb: 'Represents a grammar as a tree of small objects that each know how to evaluate themselves.',
    tag: 'Behavioral',
    Component: Interpreter,
    code: [
      {
        lang: 'js',
        snippet: `class NumberExpr { constructor(v) { this.v = v }; interpret() { return this.v } }
class AddExpr { constructor(l, r) { this.l = l; this.r = r }; interpret() { return this.l.interpret() + this.r.interpret() } }

const expr = new AddExpr(new NumberExpr(3), new NumberExpr(4))
expr.interpret() // 7`,
      },
      {
        lang: 'python',
        snippet: `class NumberExpr:
    def __init__(self, v): self.v = v
    def interpret(self): return self.v

class AddExpr:
    def __init__(self, l, r): self.l, self.r = l, r
    def interpret(self): return self.l.interpret() + self.r.interpret()

expr = AddExpr(NumberExpr(3), NumberExpr(4))
expr.interpret()  # 7`,
      },
    ],
    realWorld:
      'Small embedded expression languages — spreadsheet formulas, search-query syntax, feature-flag rules — where hand-rolling a full parser/compiler is overkill but a tiny recursive tree of interpret() calls does the job.',
    pitfall:
      'Hand-rolled interpreters don\'t scale past toy grammars — anything beyond a handful of rules is faster and safer to build on an existing parser generator or expression library instead.',
    fix:
      'Reach for an existing parser generator (ANTLR, PEG.js) or expression-evaluation library once the grammar grows past a handful of rules, instead of hand-extending a custom interpreter.',
  },
  {
    id: 'iterator',
    section: 'patterns',
    title: 'Iterator',
    blurb: 'Provides a way to step through a collection without exposing its internal structure.',
    tag: 'Behavioral',
    Component: Iterator,
    code: [
      {
        lang: 'js',
        snippet: `class Collection {
  #items = []
  add(item) { this.#items.push(item) }
  [Symbol.iterator]() {
    let i = 0
    const items = this.#items
    return { next: () => (i < items.length ? { value: items[i++], done: false } : { done: true }) }
  }
}

for (const item of new Collection()) { /* ... */ }`,
      },
      {
        lang: 'python',
        snippet: `class Collection:
    def __init__(self):
        self._items = []

    def add(self, item):
        self._items.append(item)

    def __iter__(self):
        return iter(self._items)

for item in Collection():
    ...`,
      },
    ],
    realWorld:
      "JS's own `for...of` protocol (`Symbol.iterator`) is this pattern built into the language — any custom data structure (tree, linked list, paginated API results) can be walked with the same `for...of` once it implements `next()`.",
    pitfall:
      'A custom iterator that mutates the underlying collection while iterating over it invalidates its own cursor — the classic "modified during iteration" bug still applies here.',
    fix:
      'Iterate over a snapshot or copy of the collection if it might be mutated during the loop, or use an iterator implementation that explicitly detects and errors on concurrent modification.',
  },
  {
    id: 'mediator',
    section: 'patterns',
    title: 'Mediator',
    blurb: 'Centralizes how a set of objects communicate, so they never reference each other directly.',
    tag: 'Behavioral',
    Component: Mediator,
    code: [
      {
        lang: 'js',
        snippet: `class ChatRoom {
  #users = []
  join(user) { this.#users.push(user); user.room = this }
  send(from, msg) {
    for (const u of this.#users) if (u !== from) u.receive(from, msg)
  }
}`,
      },
      {
        lang: 'python',
        snippet: `class ChatRoom:
    def __init__(self):
        self.users = []

    def join(self, user):
        self.users.append(user)
        user.room = self

    def send(self, sender, msg):
        for u in self.users:
            if u is not sender:
                u.receive(sender, msg)`,
      },
    ],
    realWorld:
      'Chat rooms, air traffic control towers, and UI dialogs where many widgets need to react to each other (checkbox toggles disable a field) — every colleague talks only to the mediator, not to N-1 other colleagues directly.',
    pitfall:
      'The mediator itself can turn into a god object that knows about every interaction in the system — it consolidates coupling, it doesn\'t eliminate it.',
    fix:
      'Split one large mediator into several smaller, purpose-specific mediators — one per interaction domain — once it starts accumulating unrelated responsibilities.',
  },
  {
    id: 'memento',
    section: 'patterns',
    title: 'Memento',
    blurb: "Captures an object's internal state so it can be restored later, without breaking encapsulation.",
    tag: 'Behavioral',
    Component: Memento,
    code: [
      {
        lang: 'js',
        snippet: `class Editor {
  #text = ''
  type(s) { this.#text += s }
  save() { return this.#text } // opaque snapshot
  restore(snapshot) { this.#text = snapshot }
}

const history = []
history.push(editor.save())
editor.restore(history.pop())`,
      },
      {
        lang: 'python',
        snippet: `class Editor:
    def __init__(self):
        self._text = ''

    def type(self, s):
        self._text += s

    def save(self):
        return self._text  # opaque snapshot

    def restore(self, snapshot):
        self._text = snapshot

history = []
history.append(editor.save())
editor.restore(history.pop())`,
      },
    ],
    realWorld:
      'Undo history in text/graphics editors and transactional rollback (save a snapshot before a risky operation, restore it if the operation fails) — the caretaker holding the snapshots never needs to understand what is inside them.',
    pitfall:
      'Storing memento snapshots without ever pruning the history leaks memory over a long session — an undo stack needs a size cap, or it just grows forever.',
    fix:
      'Cap the undo stack at a fixed size (drop the oldest snapshot when the cap is hit), or periodically compact/checkpoint history instead of keeping every single snapshot forever.',
  },
  {
    id: 'observer',
    section: 'patterns',
    title: 'Observer',
    blurb: 'Notifies a list of dependents automatically whenever the subject they watch changes.',
    tag: 'Behavioral',
    Component: Observer,
    code: [
      {
        lang: 'js',
        snippet: `class Subject {
  #observers = []
  subscribe(fn) { this.#observers.push(fn) }
  notify(data) { this.#observers.forEach((fn) => fn(data)) }
}

const product = new Subject()
product.subscribe((price) => console.log('price changed:', price))`,
      },
      {
        lang: 'python',
        snippet: `class Subject:
    def __init__(self):
        self._observers = []

    def subscribe(self, fn):
        self._observers.append(fn)

    def notify(self, data):
        for fn in self._observers:
            fn(data)

product = Subject()
product.subscribe(lambda price: print('price changed:', price))`,
      },
    ],
    realWorld:
      "DOM `addEventListener`, React state subscriptions, and pub/sub systems (Redis pub/sub, EventEmitter) — the subject broadcasts a change once and doesn't need to know or care who's listening.",
    pitfall:
      'An observer that\'s never unsubscribed keeps the subject holding a reference to it forever — this is one of the most common memory-leak sources in event-driven UIs.',
    fix:
      'Always pair `subscribe` with an explicit `unsubscribe` on teardown (component unmount, object disposal), or use weak references so a forgotten observer can still be garbage collected.',
  },
  {
    id: 'state',
    section: 'patterns',
    title: 'State',
    blurb: "Lets an object change its behavior when its internal state changes, as if it changed class.",
    tag: 'Behavioral',
    Component: StatePattern,
    code: [
      {
        lang: 'js',
        snippet: `class PendingState { next(order) { order.state = new ShippedState() } }
class ShippedState { next(order) { order.state = new DeliveredState() } }
class DeliveredState { next() { /* terminal */ } }

class Order {
  state = new PendingState()
  next() { this.state.next(this) }
}`,
      },
      {
        lang: 'python',
        snippet: `class PendingState:
    def next(self, order): order.state = ShippedState()

class ShippedState:
    def next(self, order): order.state = DeliveredState()

class DeliveredState:
    def next(self, order): pass  # terminal

class Order:
    def __init__(self):
        self.state = PendingState()

    def next(self):
        self.state.next(self)`,
      },
    ],
    realWorld:
      "Order/workflow status machines (Pending → Shipped → Delivered), TCP connection states, and traffic light controllers — each state's own class defines what its transitions do, instead of one giant `switch (status)` scattered across the codebase.",
    pitfall:
      'Because transitions live inside each state class instead of one place, it\'s easy to lose track of the overall state machine — worth diagramming the transitions separately so nobody has to reconstruct them by reading N classes.',
    fix:
      'Keep a single state-transition diagram (even just a comment or doc) as the source of truth, and consider centralizing the transition table if per-class scattering starts causing bugs.',
  },
  {
    id: 'strategy',
    section: 'patterns',
    title: 'Strategy',
    blurb: 'Makes an algorithm swappable at runtime by encapsulating each variant behind the same interface.',
    tag: 'Behavioral',
    Component: Strategy,
    code: [
      {
        lang: 'js',
        snippet: `const strategies = {
  card: (total) => total * 0.029 + 0.3,
  paypal: (total) => total * 0.034,
}

function checkout(total, strategyKey) {
  return total + strategies[strategyKey](total)
}`,
      },
      {
        lang: 'python',
        snippet: `strategies = {
    'card': lambda total: total * 0.029 + 0.3,
    'paypal': lambda total: total * 0.034,
}

def checkout(total, strategy_key):
    return total + strategies[strategy_key](total)`,
      },
    ],
    realWorld:
      'Payment processing, sort comparators passed to `.sort(cmp)`, and pricing/discount rules — swapping the strategy object changes the algorithm entirely without touching the code that calls it.',
    pitfall:
      'If two strategies actually share 90% of their logic, forcing them into fully separate classes duplicates that shared part — sometimes a single function with a parameter is honestly simpler than the pattern.',
    fix:
      'Factor the shared 90% into a common base or a shared helper function that each strategy calls, so only the genuinely differing part lives in each strategy class.',
  },
  {
    id: 'template-method',
    section: 'patterns',
    title: 'Template Method',
    blurb: 'Defines the skeleton of an algorithm in a base class, deferring specific steps to subclasses.',
    tag: 'Behavioral',
    Component: TemplateMethod,
    code: [
      {
        lang: 'js',
        snippet: `class CaffeineBeverage {
  prepare() {
    this.boilWater()
    this.brew() // subclass hook
    this.pourInCup()
    this.addCondiments() // subclass hook
  }
  boilWater() { /* shared */ }
  pourInCup() { /* shared */ }
}

class Tea extends CaffeineBeverage {
  brew() { /* steep tea bag */ }
  addCondiments() { /* add lemon */ }
}`,
      },
      {
        lang: 'python',
        snippet: `class CaffeineBeverage:
    def prepare(self):
        self.boil_water()
        self.brew()           # subclass hook
        self.pour_in_cup()
        self.add_condiments() # subclass hook

    def boil_water(self): ...  # shared
    def pour_in_cup(self): ... # shared

class Tea(CaffeineBeverage):
    def brew(self): ...           # steep tea bag
    def add_condiments(self): ... # add lemon`,
      },
    ],
    realWorld:
      'Test framework lifecycles (`setUp()` → `test()` → `tearDown()`), and any base class that fixes the overall sequence of an operation (`render()`, `save()`) while letting subclasses fill in only the steps that actually differ.',
    pitfall:
      'Subclasses can only override the specific hook steps the base class exposes — if a subclass needs to change the overall sequence itself, template method doesn\'t allow that without breaking the contract.',
    fix:
      'If a subclass needs to reorder or skip steps, that\'s a sign template method is the wrong pattern for it — switch to strategy (inject the whole algorithm) instead of forcing it through hook overrides.',
  },
  {
    id: 'visitor',
    section: 'patterns',
    title: 'Visitor',
    blurb: 'Adds new operations to a set of classes without modifying the classes themselves.',
    tag: 'Behavioral',
    Component: Visitor,
    code: [
      {
        lang: 'js',
        snippet: `class Circle { accept(visitor) { return visitor.visitCircle(this) } }
class Square { accept(visitor) { return visitor.visitSquare(this) } }

const areaVisitor = {
  visitCircle: (c) => Math.PI * c.radius ** 2,
  visitSquare: (s) => s.side ** 2,
}

shapes.map((s) => s.accept(areaVisitor))`,
      },
      {
        lang: 'python',
        snippet: `class Circle:
    def accept(self, visitor): return visitor.visit_circle(self)

class Square:
    def accept(self, visitor): return visitor.visit_square(self)

class AreaVisitor:
    def visit_circle(self, c): return math.pi * c.radius ** 2
    def visit_square(self, s): return s.side ** 2

[shape.accept(AreaVisitor()) for shape in shapes]`,
      },
    ],
    realWorld:
      'AST tooling — linters, compilers, and code formatters all "visit" every node type with a different operation (type-check, transpile, pretty-print) without the AST node classes themselves knowing about any of those operations.',
    pitfall:
      'Adding a new shape (not a new operation) means touching every existing visitor — it optimizes for new operations over a fixed set of types, so it\'s the wrong tool when new types are the thing that changes often.',
    fix:
      'If new types are more likely to appear than new operations, put the operations back on the types themselves (plain polymorphism) instead — reserve visitor for when operations are the axis that changes.',
  },
]
