import SingleResponsibility from '../concepts/solid/SingleResponsibility.jsx'
import OpenClosed from '../concepts/solid/OpenClosed.jsx'
import LiskovSubstitution from '../concepts/solid/LiskovSubstitution.jsx'
import InterfaceSegregation from '../concepts/solid/InterfaceSegregation.jsx'
import DependencyInversion from '../concepts/solid/DependencyInversion.jsx'

// Registry for the /solid section — the 5 SOLID object-oriented design
// principles. Same shape as data/patternsConcepts.js: single `code` block
// (js + python tabs) plus realWorld/pitfall/fix.
export const solidConcepts = [
  {
    id: 'srp',
    section: 'solid',
    title: 'Single Responsibility',
    blurb: 'A class should have exactly one reason to change.',
    tag: 'S',
    Component: SingleResponsibility,
    code: [
      {
        lang: 'js',
        snippet: `class ReportGenerator {
  generate(data) { return \`Report: \${data.length} rows\` }
}
class ReportSaver {
  save(text) { fs.writeFileSync('report.txt', text) }
}
class ReportEmailer {
  send(text, to) { mailer.send(to, text) }
}`,
      },
      {
        lang: 'python',
        snippet: `class ReportGenerator:
    def generate(self, data):
        return f'Report: {len(data)} rows'

class ReportSaver:
    def save(self, text):
        Path('report.txt').write_text(text)

class ReportEmailer:
    def send(self, text, to):
        mailer.send(to, text)`,
      },
    ],
    realWorld:
      "Splitting a `UserController` that validates input, talks to the database, and formats the HTTP response into three collaborators — most \"god class\" complaints in code review are an SRP violation wearing a different name.",
    pitfall:
      'Splitting too aggressively creates a maze of tiny classes for trivial responsibilities — a class with two tightly-coupled fields and one caller doesn\'t need three collaborators to satisfy the letter of the rule.',
    fix:
      'Only split when each piece actually has an independent reason to change and its own testable behavior — a class that only ever changes for one reason doesn\'t need to be split preemptively.',
  },
  {
    id: 'ocp',
    section: 'solid',
    title: 'Open/Closed',
    blurb: 'Open for extension, closed for modification — add behavior without editing what already works.',
    tag: 'O',
    Component: OpenClosed,
    code: [
      {
        lang: 'js',
        snippet: `class Circle { constructor(r) { this.r = r }; area() { return Math.PI * this.r ** 2 } }
class Square { constructor(s) { this.s = s }; area() { return this.s ** 2 } }

class AreaCalculator {
  total(shapes) { return shapes.reduce((sum, s) => sum + s.area(), 0) }
}

// adding Triangle costs zero changes to AreaCalculator
class Triangle { constructor(b, h) { this.b = b; this.h = h }; area() { return 0.5 * this.b * this.h } }`,
      },
      {
        lang: 'python',
        snippet: `class Circle:
    def __init__(self, r): self.r = r
    def area(self): return math.pi * self.r ** 2

class Square:
    def __init__(self, s): self.s = s
    def area(self): return self.s ** 2

class AreaCalculator:
    def total(self, shapes):
        return sum(s.area() for s in shapes)

# adding Triangle costs zero changes to AreaCalculator
class Triangle:
    def __init__(self, b, h): self.b, self.h = b, h
    def area(self): return 0.5 * self.b * self.h`,
      },
    ],
    realWorld:
      "Plugin systems, middleware pipelines, and payment-provider integrations — new shapes/plugins/providers arrive by adding a new class, not by editing a central switch statement every other type also flows through.",
    pitfall:
      "Wrapping every future possibility behind an extension point before a second variant exists is speculative — most \"open for extension\" hooks never actually get extended.",
    fix:
      'Add the extension point once a second concrete case actually shows up, not before — refactoring a switch statement into polymorphism later is a small, mechanical change.',
  },
  {
    id: 'lsp',
    section: 'solid',
    title: 'Liskov Substitution',
    blurb: 'A subtype must be usable anywhere its base type is expected, without surprising the caller.',
    tag: 'L',
    Component: LiskovSubstitution,
    code: [
      {
        lang: 'js',
        snippet: `class Shape { area() { throw new Error('not implemented') } }

class Rectangle extends Shape {
  constructor(w, h) { super(); this.w = w; this.h = h }
  area() { return this.w * this.h }
}

class Square extends Shape {
  constructor(side) { super(); this.side = side }
  area() { return this.side ** 2 }
}

// works for any Shape — no "if it's a Square, handle it differently"
function resize(shape) { return shape.area() }`,
      },
      {
        lang: 'python',
        snippet: `class Shape:
    def area(self): raise NotImplementedError

class Rectangle(Shape):
    def __init__(self, w, h): self.w, self.h = w, h
    def area(self): return self.w * self.h

class Square(Shape):
    def __init__(self, side): self.side = side
    def area(self): return self.side ** 2

# works for any Shape — no "if it's a Square, handle it differently"
def resize(shape): return shape.area()`,
      },
    ],
    realWorld:
      "Any place a base type is used polymorphically — ORM query methods, UI widget hierarchies, collection interfaces — callers assume any subtype passed in behaves like the base type's contract promises, not a special case of it.",
    pitfall:
      "Chasing strict LSP compliance can turn into avoiding inheritance altogether even where it's the right fit — composition isn't automatically superior just because a Square/Rectangle example went wrong once.",
    fix:
      'Use inheritance when a subclass truly is the same type behaviorally, not just structurally — if a subtype has to weaken a precondition or strengthen a postcondition to fit, it\'s not an "is-a" relationship, so model it separately instead.',
  },
  {
    id: 'isp',
    section: 'solid',
    title: 'Interface Segregation',
    blurb: "Don't force a class to depend on methods it never uses.",
    tag: 'I',
    Component: InterfaceSegregation,
    code: [
      {
        lang: 'js',
        snippet: `const workable = { work: () => 'coding' }
const feedable = { eat: () => 'lunch' }

const human = { ...workable, ...feedable }
const robot = { ...workable } // never forced to implement eat()

robot.work() // fine
robot.eat // undefined — nothing pretends robots eat`,
      },
      {
        lang: 'python',
        snippet: `class Workable(Protocol):
    def work(self): ...

class Feedable(Protocol):
    def eat(self): ...

class Human(Workable, Feedable):
    def work(self): return 'coding'
    def eat(self): return 'lunch'

class Robot(Workable):  # never forced to implement eat()
    def work(self): return 'welding'`,
      },
    ],
    realWorld:
      "React's per-prop callback signatures, and Go's `io` package splitting `Reader`/`Writer`/`Closer` into separate single-method interfaces — clients depend only on the slice of behavior they actually call.",
    pitfall:
      'Over-segmenting into single-method interfaces on things that always change together produces more files to keep in sync than the original interface ever cost.',
    fix:
      "Split an interface once distinct clients are actually being forced to depend on methods they don't use — not by default for every interface up front.",
  },
  {
    id: 'dip',
    section: 'solid',
    title: 'Dependency Inversion',
    blurb: 'High-level modules should depend on abstractions, not on concrete low-level implementations.',
    tag: 'D',
    Component: DependencyInversion,
    code: [
      {
        lang: 'js',
        snippet: `class PaymentService {
  constructor(gateway) { this.gateway = gateway } // depends on the abstraction
  pay(amount) { return this.gateway.charge(amount) }
}

const stripeGateway = { charge: (amt) => \`Stripe charged $\${amt}\` }
const mockGateway = { charge: (amt) => \`mock charged $\${amt}\` }

new PaymentService(stripeGateway).pay(20) // swap the gateway, PaymentService never changes`,
      },
      {
        lang: 'python',
        snippet: `class PaymentService:
    def __init__(self, gateway):  # depends on the abstraction
        self.gateway = gateway

    def pay(self, amount):
        return self.gateway.charge(amount)

stripe_gateway = type('Stripe', (), {'charge': lambda self, amt: f'Stripe charged \${amt}'})()
mock_gateway = type('Mock', (), {'charge': lambda self, amt: f'mock charged \${amt}'})()

PaymentService(stripe_gateway).pay(20)  # swap the gateway, PaymentService never changes`,
      },
    ],
    realWorld:
      "Repository interfaces in a service layer, dependency-injection containers, and mocking in tests — business logic imports an abstract `PaymentGateway`, and Stripe, PayPal, or a test double get swapped in at the edge without touching it.",
    pitfall:
      "Introducing an abstraction over a dependency you'll only ever have one real implementation of is pure ceremony — the same trap as an unnecessary factory.",
    fix:
      'Depend on the concrete class directly until a second real implementation (or a test double) actually needs to be swapped in — then extract the interface.',
  },
]
