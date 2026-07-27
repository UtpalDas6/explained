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
  },
]
