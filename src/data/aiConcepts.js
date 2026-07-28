import { createElement } from 'react'
import StateDemo from '../concepts/shared/StateDemo.jsx'

// Registry for the /ai section — 32 AI integration topics, grouped Language
// Models / Vectors & Retrieval / RAG / Knowledge Graphs / Agents / Loop &
// Graph Engineering / Frontier. Reuses the same before/after StateDemo the
// Git Commands, API Design, and Databases sections use.
const demo = (props) => () => createElement(StateDemo, props)

export const aiConcepts = [
  {
    id: 'llm',
    section: 'ai',
    title: 'LLM (Large Language Model)',
    blurb: 'A model trained on massive text corpora to predict the next token — scale (parameters, data, compute) is what makes it broadly capable.',
    tag: 'Language Models',
    Component: demo({
      command: 'predict the next token',
      before: [{ label: '"The capital of France is"', color: 'var(--accent)' }],
      after: [{ label: '"The capital of France is Paris"', sub: 'next-token prediction, repeated', color: 'var(--good)' }],
      note: {
        before: 'The model sees a sequence of tokens and nothing else — no database lookup, no built-in facts, just learned statistical patterns.',
        after: 'Each generated token becomes part of the input for predicting the next one — an LLM is fundamentally one operation, applied repeatedly.',
      },
    }),
    code: [{ lang: 'python', snippet: `response = llm.generate(\n    prompt="The capital of France is",\n    max_tokens=5,\n)\n# "Paris" — produced one token at a time, each conditioned on everything before it` }],
    realWorld:
      'GPT, Claude, Gemini, and Llama all share this same core mechanism — a single next-token-prediction model, scaled up and fine-tuned into something that can hold a conversation, write code, or reason step by step.',
    pitfall:
      "An LLM has no built-in fact-checker — it predicts plausible-sounding tokens, which means a confident, fluent, and completely wrong answer (a hallucination) looks identical in tone to a correct one.",
    fix:
      "Ground factual claims in retrieved, verifiable sources (see RAG) rather than trusting the model's parametric memory alone for anything that needs to be accurate.",
  },
  {
    id: 'slm',
    section: 'ai',
    title: 'SLM (Small Language Model)',
    blurb: 'A deliberately smaller model — often distilled from a larger one — trading some general capability for speed, cost, and the ability to run on-device.',
    tag: 'Language Models',
    Component: demo({
      command: 'swap to a smaller model',
      before: [{ label: '70B-parameter LLM', sub: 'cloud GPU, 800ms latency, $/call', color: 'var(--accent)' }],
      after: [{ label: '3B-parameter SLM', sub: 'runs on-device, <50ms, free per call', color: 'var(--good)' }],
      note: {
        before: 'A frontier-scale model handles the task fine, but every call means a network round trip, real latency, and real per-token cost.',
        after: 'A small, distilled model handles the same narrow task locally — instant and free to run, at the cost of general capability outside that task.',
      },
    }),
    code: [{ lang: 'python', snippet: `# frontier model: broad capability, real latency + cost per call\nresult = big_llm.generate(prompt)\n\n# distilled small model: narrow task, runs on-device, near-zero latency\nresult = phi3_mini.generate(prompt)  # e.g. Phi-3, Gemma 2B, on a phone` }],
    realWorld:
      "On-device autocomplete, offline voice assistants, and latency-critical classification (spam filtering, intent detection) all reach for an SLM instead of round-tripping to a frontier model for a task that doesn't need one.",
    pitfall:
      'An SLM fine-tuned or distilled for one narrow task degrades sharply outside that task — the same model that nails intent classification can produce noticeably worse general reasoning or writing.',
    fix:
      'Scope an SLM to the specific task it was distilled for, and fall back to a larger model (or route dynamically) for anything outside that narrow domain.',
  },
  {
    id: 'context-window',
    section: 'ai',
    title: 'Context Window',
    blurb: 'The maximum number of tokens (input + output combined) a model can attend to in a single call — everything outside it is invisible to the model.',
    tag: 'Language Models',
    Component: demo({
      command: 'exceed the window',
      before: [{ label: '200K-token context window', sub: '180K tokens of history + prompt', color: 'var(--accent)' }],
      after: [{ label: '+30K more tokens', sub: 'rejected, or oldest tokens silently truncated', color: 'var(--bad)' }],
      note: {
        before: 'The conversation and retrieved documents together are still under the limit — everything fits, and the model can see all of it.',
        after: "Pushing past the limit means either an outright error, or silent truncation — the model loses access to whatever got cut, with no warning in its own output.",
      },
    }),
    code: [{ lang: 'python', snippet: `response = llm.generate(\n    messages=conversation_history,  # must total <= context_window tokens\n    max_tokens=1000,\n)\n# if tokens(conversation_history) + max_tokens > context_window: error` }],
    realWorld:
      'Long-running chat assistants and agents that accumulate tool outputs over many steps both run into this constantly — a context window that looked generous at the start of a session can fill up fast.',
    pitfall:
      'A model doesn\'t reliably weigh every part of a full context window equally — information buried in the middle of a very long context is measurably more likely to be ignored than information near the start or end ("lost in the middle").',
    fix:
      'Keep the most important instructions and facts near the start or end of the prompt, and actively prune or summarize old conversation turns instead of letting context grow unbounded.',
  },
  {
    id: 'tokenization',
    section: 'ai',
    title: 'Tokens & Tokenization',
    blurb: 'Text is split into sub-word tokens before a model ever sees it — the unit everything (context limits, pricing, output) is actually measured in.',
    tag: 'Language Models',
    Component: demo({
      command: 'tokenize the string',
      before: [{ label: '"unbelievable"', sub: '1 word', color: 'var(--accent)' }],
      after: [{ label: '["un", "believ", "able"]', sub: '3 tokens', color: 'var(--good)' }],
      note: {
        before: 'A human reads this as one word.',
        after: 'The tokenizer splits it into sub-word pieces it has actually seen during training — word count and token count are two different numbers.',
      },
    }),
    code: [{ lang: 'python', snippet: `tokens = tokenizer.encode("unbelievable")\n# ["un", "believ", "able"]  -> 3 tokens, not 1\nlen(tokens)  # this is what counts against the context window and the bill` }],
    realWorld:
      'API pricing, rate limits, and context window limits are all denominated in tokens, not words or characters — a rough rule of thumb (1 token ≈ 4 characters of English) is why cost estimates are given in tokens.',
    pitfall:
      'Tokenizers split non-English text and code less efficiently than English prose — the same sentence can cost noticeably more tokens in another language, silently inflating cost and eating more of the context window.',
    fix:
      'Estimate token counts with the actual tokenizer for non-English or code-heavy content instead of assuming the word-count rule of thumb, and budget context/cost accordingly.',
  },
  {
    id: 'fine-tuning-vs-prompting',
    section: 'ai',
    title: 'Fine-Tuning vs Prompting',
    blurb: "Prompting adapts a frozen model's behavior at inference time; fine-tuning actually updates its weights on your own examples.",
    tag: 'Language Models',
    Component: demo({
      command: 'fine-tune instead',
      before: [{ label: 'base model + a long few-shot prompt', sub: 're-sent, re-paid, every call', color: 'var(--accent)' }],
      after: [{ label: 'fine-tuned model', sub: 'behavior baked in, short prompt, cheaper per call', color: 'var(--good)' }],
      note: {
        before: 'The examples teaching the model the desired format/tone have to be included in every single request — real tokens spent every time.',
        after: 'The model has learned the pattern from training examples directly — the same behavior with a much shorter (or empty) prompt.',
      },
    }),
    code: [{ lang: 'python', snippet: `# Prompting: examples sent on every call\nprompt = few_shot_examples + "\\n\\n" + user_input\n\n# Fine-tuning: examples trained in once\nfine_tuned_model = client.fine_tune(base_model="gpt-4o-mini", training_file=examples)\nresponse = fine_tuned_model.generate(user_input)  # no examples needed anymore` }],
    realWorld:
      "A customer-support bot that must always reply in a strict JSON schema, in the brand's exact tone, is a common fine-tuning case — prompting is enough for most one-off or evolving-requirements use cases.",
    pitfall:
      "Fine-tuning is a much bigger commitment than prompting — it needs a real training dataset, retraining every time requirements change, and doesn't let you inspect or edit \"why\" the model does something the way a prompt does.",
    fix:
      "Start with prompting (and few-shot examples) — reach for fine-tuning only once a stable, high-volume behavior pattern has emerged that a prompt can't reliably or economically produce.",
  },
  {
    id: 'quantization',
    section: 'ai',
    title: 'Quantization',
    blurb: "Compressing a model's weights to lower numerical precision (e.g. 16-bit → 4-bit) to shrink memory footprint and speed up inference, at a small accuracy cost.",
    tag: 'Language Models',
    Component: demo({
      command: 'quantize the weights',
      before: [{ label: 'FP16 weights', sub: '140GB, needs multiple high-end GPUs', color: 'var(--accent)' }],
      after: [{ label: 'INT4 quantized', sub: '~35GB, runs on a single consumer GPU', color: 'var(--good)' }],
      note: {
        before: 'Full precision weights need a lot of memory just to load the model, before a single token is generated.',
        after: 'Quantized weights take a quarter of the space — the model runs on much cheaper hardware, at a small, usually acceptable, accuracy cost.',
      },
    }),
    code: [{ lang: 'python', snippet: `model = AutoModelForCausalLM.from_pretrained(\n    "meta-llama/Llama-3-70b",\n    quantization_config=BitsAndBytesConfig(load_in_4bit=True),\n)\n# ~4x smaller memory footprint, minor accuracy tradeoff` }],
    realWorld:
      "Running a 70B-parameter model on a single consumer GPU, or an LLM on a phone at all, is only possible because of quantization — full-precision weights simply wouldn't fit.",
    pitfall:
      "Quantizing too aggressively (very low bit-widths) can measurably degrade accuracy on tasks that need precise reasoning, like arithmetic or careful instruction-following — the tradeoff isn't free.",
    fix:
      'Benchmark the quantized model on your actual task before shipping it — 8-bit or 4-bit is usually safe for most tasks, but validate rather than assume, especially for reasoning-heavy use cases.',
  },
  {
    id: 'embeddings',
    section: 'ai',
    title: 'Embeddings',
    blurb: 'A dense numerical vector that represents the meaning of text (or an image), positioned so that semantically similar inputs land near each other.',
    tag: 'Vectors & Retrieval',
    Component: demo({
      command: 'embed the text',
      before: [{ label: '"a happy dog" (text)', color: 'var(--accent)' }],
      after: [{ label: '[0.12, -0.87, 0.33, ... 1536 dims]', sub: 'near "joyful puppy" in vector space', color: 'var(--good)' }],
      note: {
        before: 'Two sentences that mean nearly the same thing look completely different as raw strings — no shared characters, no obvious relationship.',
        after: 'As vectors, semantically similar text lands close together in the embedding space — distance now measures meaning, not spelling.',
      },
    }),
    code: [{ lang: 'python', snippet: `vector = embedding_model.embed("a happy dog")\n# [0.12, -0.87, 0.33, ...] -- a point in high-dimensional space\n\nsimilarity = cosine_similarity(\n    embedding_model.embed("a happy dog"),\n    embedding_model.embed("a joyful puppy"),\n)  # high — close in meaning, despite sharing no words` }],
    realWorld:
      '"Customers who liked this also liked...", semantic search, and duplicate detection all rely on embeddings — comparing meaning instead of exact keyword matches.',
    pitfall:
      'Embeddings from two different models (or even different versions of the same model) live in incompatible vector spaces — comparing a vector from one model against a vector from another produces meaningless distances.',
    fix:
      'Always embed queries and documents with the exact same model and version, and re-embed the entire corpus if the embedding model is ever upgraded.',
  },
  {
    id: 'vector-database',
    section: 'ai',
    title: 'Vector Database',
    blurb: 'A database purpose-built to store embeddings and answer "find the most similar vectors to this one" queries at scale.',
    tag: 'Vectors & Retrieval',
    Component: demo({
      command: 'query by similarity',
      before: [{ label: 'linear scan: 10M vectors, one by one', color: 'var(--bad)' }],
      after: [{ label: 'vector DB index (HNSW)', sub: 'approximate top-10 in milliseconds', color: 'var(--good)' }],
      note: {
        before: 'Brute-force comparing a query vector against every stored vector is correct, but far too slow for a live application at 10 million vectors.',
        after: 'A purpose-built index finds the (approximately) closest matches in milliseconds — trading a small amount of recall for a massive speedup.',
      },
    }),
    code: [{ lang: 'python', snippet: `db = VectorDB.connect("orders-index")\nresults = db.query(\n    vector=embedding_model.embed("wireless noise-cancelling headphones"),\n    top_k=10,\n)` }],
    realWorld:
      'Pinecone, Weaviate, pgvector, and Qdrant all exist specifically to make similarity search over millions of embeddings fast enough to sit in the critical path of a user request.',
    pitfall:
      'Storing embeddings without also storing enough metadata (source document, timestamp, permissions) to filter results means a similarity search can return content a specific user should never have seen.',
    fix:
      'Store access-control and filtering metadata alongside every vector, and apply those filters as part of the similarity query itself, not as a separate check afterward.',
  },
  {
    id: 'ann-search',
    section: 'ai',
    title: 'Approximate Nearest Neighbor (ANN) Search',
    blurb: 'The algorithms (HNSW, IVF) vector databases use to find *approximately* the closest vectors fast, instead of the exact closest ones slowly.',
    tag: 'Vectors & Retrieval',
    Component: demo({
      command: 'trade exactness for speed',
      before: [{ label: 'exact k-NN: O(n) per query', sub: 'correct, too slow at scale', color: 'var(--accent)' }],
      after: [{ label: 'HNSW graph traversal: O(log n)', sub: '~99% recall, orders of magnitude faster', color: 'var(--good)' }],
      note: {
        before: "Exact nearest-neighbor search checks every vector — perfectly accurate, but its cost grows linearly with collection size.",
        after: 'An approximate index reaches a near-optimal answer by hopping through a small number of nodes instead of checking everything — vastly faster, occasionally missing the true best match.',
      },
    }),
    code: [{ lang: 'python', snippet: `index = hnswlib.Index(space='cosine', dim=1536)\nindex.init_index(max_elements=10_000_000, ef_construction=200, M=16)\nindex.add_items(vectors, ids)\n\nlabels, distances = index.knn_query(query_vector, k=10)  # approximate, fast` }],
    realWorld:
      "Every production-scale vector database (Pinecone, Milvus, pgvector's HNSW index) uses ANN under the hood — exact search doesn't scale to millions or billions of vectors.",
    pitfall:
      "ANN indexes trade recall for speed by design — tuned too aggressively for speed, a search can miss genuinely relevant results without any error, since the algorithm doesn't know what it missed.",
    fix:
      "Tune the index's recall/speed tradeoff parameters (like ef_search in HNSW) based on measured recall against a ground-truth exact search on a sample, not just default settings.",
  },
  {
    id: 'chunking-strategy',
    section: 'ai',
    title: 'Chunking Strategy',
    blurb: "Splitting long documents into smaller pieces before embedding them — chunk size and boundaries directly determine what retrieval can and can't find.",
    tag: 'Vectors & Retrieval',
    Component: demo({
      command: 'chunk by structure, not size',
      before: [{ label: 'fixed 500-char chunks', sub: 'splits mid-sentence, mid-table', color: 'var(--bad)' }],
      after: [{ label: 'chunk by section/paragraph', sub: 'each chunk is one coherent idea', color: 'var(--good)' }],
      note: {
        before: "A naive fixed-length split can cut a sentence (or table row) in half, spreading one idea across two chunks that don't individually make sense.",
        after: 'Chunking along natural document boundaries keeps each piece self-contained and retrievable as a coherent unit on its own.',
      },
    }),
    code: [{ lang: 'python', snippet: `# Bad: arbitrary character count, ignores structure\nchunks = [text[i:i+500] for i in range(0, len(text), 500)]\n\n# Good: split along semantic boundaries\nchunks = markdown_splitter.split(text, by=["heading", "paragraph"])` }],
    realWorld:
      'RAG systems live or die on chunking quality — a well-chunked knowledge base retrieves the exact right paragraph; a poorly-chunked one retrieves fragments that half-answer the question.',
    pitfall:
      'Chunks with no overlap can separate a pronoun ("it", "this policy") from the sentence that defines what it refers to, losing the context needed to make sense of the chunk in isolation.',
    fix:
      'Add a small overlap (10-20%) between consecutive chunks, and prefer splitting on structural boundaries (headings, paragraphs) over arbitrary character counts.',
  },
  {
    id: 'hybrid-search',
    section: 'ai',
    title: 'Hybrid Search',
    blurb: 'Combining keyword (lexical/BM25) search with vector (semantic) search — catching both exact term matches and conceptual matches neither alone would find.',
    tag: 'Vectors & Retrieval',
    Component: demo({
      command: 'add keyword search back in',
      before: [{ label: 'vector-only: "SKU-4471"', sub: 'semantically vague, poor match', color: 'var(--bad)' }],
      after: [{ label: 'BM25 + vector search, fused', sub: 'exact SKU match found', color: 'var(--good)' }],
      note: {
        before: "Pure semantic search struggles with exact identifiers and codes — there's no \"meaning\" to a product SKU for an embedding to latch onto.",
        after: "Keyword search catches the exact term; vector search catches paraphrases and synonyms — combined, results cover both cases.",
      },
    }),
    code: [{ lang: 'python', snippet: `keyword_results = bm25_index.search("SKU-4471", top_k=20)\nvector_results = vector_db.query(embed("SKU-4471"), top_k=20)\nresults = reciprocal_rank_fusion(keyword_results, vector_results)` }],
    realWorld:
      'E-commerce search and enterprise document search both need hybrid — a customer might search by exact product code or by a vague description, and only one search type handles each well.',
    pitfall:
      'Naively picking whichever search type "wins" per query (instead of properly fusing results) tends to favor whichever method returns more confident-looking scores, not whichever is actually more relevant.',
    fix:
      "Use a principled fusion method (like reciprocal rank fusion) to combine both result sets' rankings, rather than picking one method's results outright or averaging raw, differently-scaled scores.",
  },
  {
    id: 'rag',
    section: 'ai',
    title: 'RAG (Retrieval-Augmented Generation)',
    blurb: 'Retrieves relevant documents at query time and feeds them into the prompt, so the model answers from real source material instead of memory alone.',
    tag: 'RAG',
    Component: demo({
      command: 'retrieve, then generate',
      before: [{ label: '"What\'s our Q3 refund policy?"', sub: "model's trained-in memory — outdated or invented", color: 'var(--bad)' }],
      after: [{ label: 'retrieve current policy doc → inject → answer grounded in it', color: 'var(--good)' }],
      note: {
        before: "The model's only source is whatever it memorized during training — frozen at a cutoff date, and it never saw your internal policy docs.",
        after: "The actual, current policy document is fetched and placed in the prompt — the model's answer is generated from real source material.",
      },
    }),
    code: [{ lang: 'python', snippet: `docs = vector_db.query(embed(user_question), top_k=5)\nprompt = f"Answer using only this context:\\n{docs}\\n\\nQuestion: {user_question}"\nanswer = llm.generate(prompt)` }],
    realWorld:
      'Internal company chatbots, customer support over product docs, and legal/medical Q&A over a specific corpus are the textbook RAG use case — accurate answers a general-purpose model was never trained on.',
    pitfall:
      "RAG doesn't eliminate hallucination — it just gives the model better material to work with. If retrieval returns irrelevant or wrong chunks, the model can still confidently generate an answer grounded in the wrong source.",
    fix:
      'Invest as much in retrieval quality (chunking, hybrid search, reranking) as in the generation prompt — a RAG system is only as good as what it actually retrieves.',
  },
  {
    id: 'reranking',
    section: 'ai',
    title: 'Reranking',
    blurb: 'A second, more expensive pass that re-scores the top candidates from an initial retrieval, moving the truly best matches to the top.',
    tag: 'RAG',
    Component: demo({
      command: 'rerank the top candidates',
      before: [{ label: 'top-50 vector search results', sub: 'ranked by rough embedding similarity', color: 'var(--accent)' }],
      after: [{ label: 'top-5 after reranking', sub: 'ranked by a cross-encoder scoring query+doc together', color: 'var(--good)' }],
      note: {
        before: 'Fast bi-encoder retrieval (embed query, embed doc, compare) is efficient but approximate — it scores query and document independently.',
        after: 'A slower cross-encoder scores query and each candidate together, catching relevance signals the fast first pass missed.',
      },
    }),
    code: [{ lang: 'python', snippet: `candidates = vector_db.query(embed(query), top_k=50)  # fast, approximate\nreranked = reranker_model.score(query, candidates)      # slower, precise\ntop_5 = reranked[:5]  # what actually goes into the prompt` }],
    realWorld:
      'Search engines and RAG pipelines both use a fast-then-precise two-stage pattern — cheap retrieval to get a shortlist, expensive reranking to get the shortlist right.',
    pitfall:
      "Reranking a shortlist that's too small (or that already missed the right document) can't recover results the first stage never surfaced — reranking only reorders what's already there.",
    fix:
      'Retrieve a generous initial candidate set (e.g. top-50) before reranking down to the top-5 actually used, so reranking has enough to work with.',
  },
  {
    id: 'grounding-citations',
    section: 'ai',
    title: 'Grounding & Citations',
    blurb: 'Requiring the model to tie every claim back to a specific source passage, so answers are verifiable instead of just plausible-sounding.',
    tag: 'RAG',
    Component: demo({
      command: 'require a citation',
      before: [{ label: '"Refunds take 5-7 days."', sub: 'no source, unverifiable', color: 'var(--bad)' }],
      after: [{ label: '"Refunds take 5-7 days [Source: refund-policy.md, §3]."', color: 'var(--good)' }],
      note: {
        before: "The claim might be entirely accurate — but there's no way to verify it without independently checking.",
        after: 'A direct pointer back to the exact source lets anyone verify the claim in seconds, and makes it obvious when the model has strayed from its sources.',
      },
    }),
    code: [{ lang: 'python', snippet: `prompt = f"""Answer using ONLY the numbered sources below.\nCite the source number for every claim.\n\n[1] {doc1}\n[2] {doc2}\n\nQuestion: {question}"""\n# expects output like: "Refunds take 5-7 days [1]."` }],
    realWorld:
      "Legal and medical RAG applications require citations by necessity — an unverifiable claim in those domains isn't just unhelpful, it's a liability.",
    pitfall:
      "A model asked to cite sources can still fabricate a plausible-looking citation number or misattribute a claim — citations reduce hallucination, they don't guarantee its absence.",
    fix:
      'Programmatically verify that cited claims actually appear in the referenced source (a substring or entailment check) rather than trusting the citation at face value.',
  },
  {
    id: 'context-stuffing-vs-retrieval',
    section: 'ai',
    title: 'Context Stuffing vs Retrieval',
    blurb: "Pasting an entire knowledge base into every prompt works until it doesn't — targeted retrieval scales where brute-force context stuffing can't.",
    tag: 'RAG',
    Component: demo({
      command: 'switch to targeted retrieval',
      before: [{ label: 'entire 400-page manual pasted into every prompt', sub: 'slow, expensive, buries the relevant part', color: 'var(--bad)' }],
      after: [{ label: 'retrieve only the 3 relevant paragraphs', sub: 'fast, cheap, focused', color: 'var(--good)' }],
      note: {
        before: 'Every call re-processes the entire document, most of which is irrelevant — slow and expensive, and the relevant part is buried in noise.',
        after: "Only the passages that actually answer the question get included — smaller prompt, faster response, undiluted attention.",
      },
    }),
    code: [{ lang: 'python', snippet: `# Bad: stuff the whole manual in every time\nprompt = f"{entire_400_page_manual}\\n\\nQuestion: {question}"\n\n# Good: retrieve just what's relevant\nrelevant_chunks = vector_db.query(embed(question), top_k=3)\nprompt = f"{relevant_chunks}\\n\\nQuestion: {question}"` }],
    realWorld:
      'A small FAQ (a few pages) is often fine stuffed directly into the prompt every time — RAG earns its complexity once the source material is too large to fit, or too large to search efficiently, every call.',
    pitfall:
      'Reaching for a full RAG pipeline (chunking, embedding, vector DB, retrieval) for a document that comfortably fits in the context window every time is unneeded complexity.',
    fix:
      'Just paste the source directly into the prompt while it reliably fits within the context window and budget — build a retrieval pipeline once the source stops fitting.',
  },
  {
    id: 'knowledge-graph',
    section: 'ai',
    title: 'Knowledge Graph',
    blurb: 'Structured, explicit facts stored as entities and relationships (Person -[WORKS_AT]-> Company) — queryable and traversable, unlike free text.',
    tag: 'Knowledge Graphs',
    Component: demo({
      command: 'query the graph',
      before: [{ label: '"Who does Ada report to?"', sub: 'search unstructured text, hope it\'s stated plainly', color: 'var(--bad)' }],
      after: [{ label: 'MATCH (ada)-[:REPORTS_TO]->(manager)', sub: 'exact, structured answer', color: 'var(--good)' }],
      note: {
        before: 'Free text might state the answer directly, imply it across several sentences, or not contain it at all.',
        after: 'The relationship is stored explicitly as structured data — the query returns the exact answer, not a best guess based on text similarity.',
      },
    }),
    code: [{ lang: 'cypher', snippet: `CREATE (ada:Person {name: "Ada"})-[:REPORTS_TO]->(grace:Person {name: "Grace"})\n\nMATCH (p:Person {name: "Ada"})-[:REPORTS_TO]->(manager)\nRETURN manager.name` }],
    realWorld:
      "Google's Knowledge Graph (the info box beside search results), enterprise org charts, and product/ingredient databases all use explicit graphs for facts that need to be precisely queryable, not just searchable.",
    pitfall:
      'Building and maintaining a knowledge graph by hand doesn\'t scale to a large, constantly-changing corpus — entities and relationships have to be kept accurate as data changes.',
    fix:
      'Automate graph construction from source documents (entity + relation extraction) rather than hand-curating it, and monitor the extraction pipeline\'s accuracy directly.',
  },
  {
    id: 'graphrag',
    section: 'ai',
    title: 'GraphRAG',
    blurb: "Combines a knowledge graph's structured relationships with RAG's retrieval — answering questions that need connecting multiple facts, not just finding one passage.",
    tag: 'Knowledge Graphs',
    Component: demo({
      command: 'traverse, then generate',
      before: [{ label: 'vector search: "How is Acme connected to the fraud case?"', sub: 'no single passage states the full connection', color: 'var(--bad)' }],
      after: [{ label: 'Acme → invested_in → ShellCo → owned_by → suspect', sub: 'multi-hop path found, then explained', color: 'var(--good)' }],
      note: {
        before: 'Plain vector retrieval finds passages similar to the question — a multi-step relationship spread across several documents may never appear in any single passage.',
        after: "The graph traversal follows the actual chain of relationships across documents — the connection retrieval alone would have missed becomes explicit.",
      },
    }),
    code: [{ lang: 'python', snippet: `path = knowledge_graph.find_path("Acme Corp", "suspect_x", max_hops=4)\n# Acme -> invested_in -> ShellCo -> owned_by -> suspect_x\n\nprompt = f"Explain this connection: {path}\\n\\nQuestion: {question}"\nanswer = llm.generate(prompt)` }],
    realWorld:
      'Fraud investigation, drug interaction discovery, and "how are these two entities related" questions are cases plain vector RAG structurally can\'t answer, since the answer spans multiple linked documents.',
    pitfall:
      "GraphRAG needs a well-built knowledge graph to traverse — if entity extraction was sloppy or the graph is sparse, there's no path to find regardless of retrieval quality.",
    fix:
      "Invest in graph construction quality (accurate entity/relation extraction) before investing in traversal logic — GraphRAG can't traverse relationships that were never correctly captured.",
  },
  {
    id: 'entity-extraction',
    section: 'ai',
    title: 'Entity Extraction & Linking',
    blurb: 'Identifying named entities (people, companies, products) in text and resolving them to a single canonical node, even when referred to differently.',
    tag: 'Knowledge Graphs',
    Component: demo({
      command: 'link the mentions',
      before: [{ label: '"Apple", "Apple Inc.", "AAPL"', sub: 'treated as 3 unrelated strings', color: 'var(--bad)' }],
      after: [{ label: 'all 3 → same node: Apple Inc. (AAPL)', color: 'var(--good)' }],
      note: {
        before: 'Different documents refer to the same company differently — without linking, they look like three unrelated entities downstream.',
        after: 'Entity linking resolves every mention to one canonical node — now every fact attaches to the same underlying entity.',
      },
    }),
    code: [{ lang: 'python', snippet: `entities = ner_model.extract("Apple reported strong earnings; AAPL rose 3%.")\n# [{"text": "Apple", "type": "ORG"}, {"text": "AAPL", "type": "TICKER"}]\n\ncanonical = entity_linker.resolve(entities)\n# both -> knowledge_graph.node("apple-inc")` }],
    realWorld:
      'Building any knowledge graph from real-world text (news, financial filings, medical records) depends on entity linking — without it, the same real-world thing fragments into many disconnected nodes.',
    pitfall:
      'Ambiguous names ("Washington" the city, state, or person) can be linked to the wrong canonical entity without enough surrounding context, silently merging or misattributing facts.',
    fix:
      'Use surrounding context (not just the entity string) for disambiguation, and set a confidence threshold below which a mention is left unlinked rather than guessed at.',
  },
  {
    id: 'tool-use',
    section: 'ai',
    title: 'Tool Use / Function Calling',
    blurb: "The model doesn't just generate text — it can output a structured request to call a specific function, then use the real result in its next step.",
    tag: 'Agents',
    Component: demo({
      command: 'call the tool',
      before: [{ label: '"What\'s the weather in Tokyo?"', sub: 'model guesses from memory — stale or fabricated', color: 'var(--bad)' }],
      after: [{ label: 'get_weather("Tokyo") → real API result → answer', color: 'var(--good)' }],
      note: {
        before: "The model's training data is frozen at a cutoff — it has no way to know today's actual weather, only what sounds plausible.",
        after: 'The model recognizes it needs live data, calls the real function, and generates its answer from the actual result.',
      },
    }),
    code: [{ lang: 'python', snippet: `tools = [{"name": "get_weather", "parameters": {"city": "string"}}]\nresponse = llm.generate(prompt, tools=tools)\n# response: {"tool_call": "get_weather", "args": {"city": "Tokyo"}}\n\nresult = get_weather("Tokyo")  # real API call\nfinal_answer = llm.generate(prompt, tool_result=result)` }],
    realWorld:
      'Every modern agent — from a coding assistant that runs shell commands to a support bot that looks up an order status — is built on function calling.',
    pitfall:
      'A model given a destructive tool (delete_file, send_email, execute_payment) with no confirmation step can call it based on a misunderstood request — the tool executes exactly what was asked, even if that was a misread.',
    fix:
      "Require explicit confirmation (human-in-the-loop) before any tool call with real-world side effects, and scope each tool's permissions as narrowly as the task needs.",
  },
  {
    id: 'react-pattern',
    section: 'ai',
    title: 'ReAct (Reason + Act)',
    blurb: 'An agent loop that interleaves reasoning ("what should I do next?") with acting (calling a tool) and observing the result, repeated until the task is done.',
    tag: 'Agents',
    Component: demo({
      command: 'reason, act, observe',
      before: [{ label: 'single-shot prompt → answer', sub: 'no chance to course-correct', color: 'var(--accent)' }],
      after: [{ label: 'Thought → Action → Observation → ... → Final Answer', color: 'var(--good)' }],
      note: {
        before: 'A one-shot prompt commits to an answer immediately, with no opportunity to check intermediate results or adjust the plan.',
        after: "Each cycle lets the agent see the real result of its last action before deciding the next one — it reacts to what actually happened.",
      },
    }),
    code: [{ lang: 'text', snippet: `Thought: I need the current stock price to answer this.\nAction: get_stock_price("AAPL")\nObservation: $182.34\nThought: Now I can compare it to the target price.\nAction: compare(182.34, 200)\nObservation: below target\nFinal Answer: AAPL is currently below the $200 target.` }],
    realWorld:
      "LangChain's original ReAct agents and most modern coding/research agents (run a command, read the output, decide the next command) all follow this exact reason-act-observe cycle.",
    pitfall:
      "Without a hard step limit, a ReAct loop can spin indefinitely on a task it's not making progress on — repeating similar actions, burning tokens and time with no forward movement.",
    fix:
      'Cap the number of reasoning/action cycles, and detect repeated or non-progressing actions explicitly so the loop can stop and report failure instead of running forever.',
  },
  {
    id: 'multi-agent-systems',
    section: 'ai',
    title: 'Multi-Agent Systems',
    blurb: 'Splitting a complex task across several specialized agents (a planner, a researcher, a writer) that collaborate, instead of one generalist agent doing everything.',
    tag: 'Agents',
    Component: demo({
      command: 'split into specialists',
      before: [{ label: '1 generalist agent', sub: 'plans, researches, writes, reviews — all at once', color: 'var(--accent)' }],
      after: [{ label: 'Planner → Researcher → Writer → Reviewer', sub: 'each agent has one job', color: 'var(--good)' }],
      note: {
        before: 'One agent juggling every responsibility at once tends to do each part shallowly — its attention is split across every concern simultaneously.',
        after: "Each agent specializes narrowly and does its one job well — the planner's prompt is entirely about planning, the writer's entirely about writing.",
      },
    }),
    code: [{ lang: 'python', snippet: `plan = planner_agent.run(task)\nresearch = researcher_agent.run(plan.research_questions)\ndraft = writer_agent.run(plan, research)\nfinal = reviewer_agent.run(draft, plan.requirements)` }],
    realWorld:
      'AI coding assistants that split into a "planning" pass and an "implementation" pass, or research tools with separate search and synthesis agents, use this specialize-and-collaborate structure.',
    pitfall:
      "More agents means more coordination overhead and more places for a handoff to lose context — a planner's nuance can get flattened into a short instruction the next agent never fully receives.",
    fix:
      'Pass structured, explicit handoff data between agents (not just a short summary) and add only as many specialized agents as the task genuinely needs.',
  },
  {
    id: 'agent-memory',
    section: 'ai',
    title: 'Agent Memory',
    blurb: 'What an agent remembers beyond its current context window — short-term (this conversation) vs long-term (facts persisted across sessions).',
    tag: 'Agents',
    Component: demo({
      command: 'persist across sessions',
      before: [{ label: 'session ends → all context lost', sub: '"What\'s my name?" asked again tomorrow', color: 'var(--bad)' }],
      after: [{ label: 'fact saved to long-term memory store', sub: "retrieved and injected next session", color: 'var(--good)' }],
      note: {
        before: "Everything the agent learned only exists inside this conversation's context window — the moment the session ends, it's gone.",
        after: "A specific fact was written to persistent storage — next time it's retrieved, so the agent doesn't have to re-learn it.",
      },
    }),
    code: [{ lang: 'python', snippet: `# end of session: extract and persist durable facts\nmemory_store.save(user_id, fact="prefers concise answers, works in Python")\n\n# start of next session: retrieve relevant memories\nrelevant_memories = memory_store.retrieve(user_id, query=current_task)\nprompt = f"{relevant_memories}\\n\\n{current_task}"` }],
    realWorld:
      "Personal assistants that remember your preferences across conversations, and coding agents that recall a project's conventions session to session, both need long-term memory outside the ephemeral context window.",
    pitfall:
      "Persisting every detail from every session bloats the memory store until retrieval starts pulling back irrelevant or outdated facts — unlimited memory isn't automatically useful memory.",
    fix:
      "Save only durable, generally-useful facts (not full transcripts), and periodically prune or consolidate memory the same way you'd prune a growing cache.",
  },
  {
    id: 'task-decomposition',
    section: 'ai',
    title: 'Planning & Task Decomposition',
    blurb: 'Breaking a large, ambiguous goal into a concrete sequence of smaller, executable steps before acting on any of them.',
    tag: 'Agents',
    Component: demo({
      command: 'decompose the task',
      before: [{ label: '"Launch the new feature"', sub: 'too vague to act on directly', color: 'var(--bad)' }],
      after: [{ label: '1. Code 2. Tests 3. Docs 4. Deploy 5. Monitor', color: 'var(--good)' }],
      note: {
        before: 'A high-level goal has no obvious first action — attempting it directly means guessing at what "launch" actually requires.',
        after: 'Broken into concrete steps, each is small enough to execute (and verify) independently.',
      },
    }),
    code: [{ lang: 'python', snippet: `plan = planner.decompose("Launch the new feature")\n# ["Write code", "Add tests", "Update docs", "Deploy", "Monitor for errors"]\n\nfor step in plan:\n    result = executor.run(step)\n    if not result.success:\n        plan = planner.replan(remaining=plan, failure=result)` }],
    realWorld:
      'Coding agents that break "add authentication" into "add user model, add login endpoint, add session middleware, add tests" rely on decomposition before execution.',
    pitfall:
      "A plan made entirely up front, with no ability to revise it after a step fails or reveals new information, tends to keep executing a plan that's no longer the right one.",
    fix:
      're-plan (or at least re-check) after each step, especially after any step that fails or returns an unexpected result — treat the plan as revisable, not fixed.',
  },
  {
    id: 'agentic-loop',
    section: 'ai',
    title: 'Agentic Loop Engineering',
    blurb: 'Designing the core observe → decide → act cycle an agent runs in — with explicit termination conditions, so it stops instead of running forever.',
    tag: 'Loop & Graph Engineering',
    Component: demo({
      command: 'add a termination condition',
      before: [{ label: 'while True: act()', sub: 'no exit — runs until it crashes or the budget runs out', color: 'var(--bad)' }],
      after: [{ label: 'while not done and steps < max_steps: act()', sub: 'explicit, bounded exit conditions', color: 'var(--good)' }],
      note: {
        before: 'An unbounded loop has no built-in reason to stop — it keeps running (and spending tokens) until something external kills it.',
        after: "The loop has explicit success and failure exit conditions — it stops on its own, either because the task is done or a defined limit is hit.",
      },
    }),
    code: [{ lang: 'python', snippet: `steps = 0\nwhile not task.is_complete() and steps < MAX_STEPS:\n    action = agent.decide(task.state)\n    result = execute(action)\n    task.update(result)\n    steps += 1\n\nif steps >= MAX_STEPS:\n    escalate_to_human(task)  # explicit failure path, not silent` }],
    realWorld:
      'Every production agent (a coding agent, a research agent, an automated support bot) needs this exact discipline — the difference between a demo that works once and a system safe to run unattended.',
    pitfall:
      'A loop that only checks "did the task succeed" and not "am I making any progress" can cycle through similar failing actions indefinitely without ever hitting a stopping condition.',
    fix:
      'Track progress explicitly (not just success/failure) — detect repeated or non-improving states and break out when progress stalls, not only when a hard step limit is hit.',
  },
  {
    id: 'orchestration-graph',
    section: 'ai',
    title: 'Orchestration Graphs',
    blurb: 'Modeling a multi-step agent workflow as an explicit graph (nodes = steps, edges = transitions) instead of one long, linear, hard-to-follow script.',
    tag: 'Loop & Graph Engineering',
    Component: demo({
      command: 'model it as a graph',
      before: [{ label: 'one long linear script', sub: 'if/else nested 6 deep for every edge case', color: 'var(--bad)' }],
      after: [{ label: 'research → draft → [needs_review? review : publish]', sub: 'branches and loops are explicit nodes/edges', color: 'var(--good)' }],
      note: {
        before: 'A single procedural script handling every possible path becomes unreadable once it has to handle more than a couple of edge cases.',
        after: "Each step is a node, each transition an edge — branches, loops, and retries are visible in the graph's structure.",
      },
    }),
    code: [{ lang: 'python', snippet: `graph = StateGraph()\ngraph.add_node("research", research_agent)\ngraph.add_node("draft", writer_agent)\ngraph.add_node("review", reviewer_agent)\ngraph.add_edge("research", "draft")\ngraph.add_conditional_edge("draft", lambda s: "review" if s.needs_review else "publish")\ngraph.add_edge("review", "draft")  # loop back on rejection` }],
    realWorld:
      'Frameworks like LangGraph model agent workflows exactly this way — a graph of steps with conditional edges is how a "revise until approved" loop stays legible as it grows.',
    pitfall:
      "A graph with too many nodes and conditional edges becomes just as hard to reason about as the nested if/else it replaced — visual structure alone doesn't make a genuinely complex workflow simple.",
    fix:
      "Keep individual nodes focused on one responsibility, and extract a cluster of tightly related nodes into its own sub-graph once the top-level graph gets hard to read at a glance.",
  },
  {
    id: 'human-in-the-loop',
    section: 'ai',
    title: 'Human-in-the-Loop',
    blurb: 'Inserting an explicit pause for human approval before an agent takes an irreversible or high-stakes action.',
    tag: 'Loop & Graph Engineering',
    Component: demo({
      command: 'add an approval gate',
      before: [{ label: 'agent decides → send_payment($5,000) → executed immediately', color: 'var(--bad)' }],
      after: [{ label: 'decides → PENDING → human approves → executed', color: 'var(--good)' }],
      note: {
        before: "A fully autonomous agent acts on its own decision immediately — if that decision was wrong, the consequence already happened.",
        after: 'The agent proposes the action but a human confirms it first — a wrong decision gets caught before it takes effect.',
      },
    }),
    code: [{ lang: 'python', snippet: `if action.risk_level == "high":\n    approval = request_human_approval(action)\n    if not approval.granted:\n        return agent.replan(rejected=action, reason=approval.reason)\nexecute(action)` }],
    realWorld:
      'Financial transactions, production deployments, and any agent action that sends external communication commonly gate on human approval — the cost of a wrong autonomous action is too high.',
    pitfall:
      'Gating every single action (not just high-stakes ones) on human approval defeats the point of automation — a human reviewing every trivial step becomes a bottleneck.',
    fix:
      'Reserve human-in-the-loop gates for genuinely high-stakes or irreversible actions — classify action risk explicitly rather than gating uniformly.',
  },
  {
    id: 'guardrails-evals',
    section: 'ai',
    title: 'Guardrails & Evals',
    blurb: 'Guardrails constrain what an agent is allowed to do at runtime; evals measure how well it actually performs, systematically, before and after every change.',
    tag: 'Loop & Graph Engineering',
    Component: demo({
      command: 'run the eval suite',
      before: [{ label: '"seems to work"', sub: 'tested by hand, a few times', color: 'var(--bad)' }],
      after: [{ label: 'eval suite: 200 cases, 94% pass', sub: 'change prompt → re-run → 91% → reverted', color: 'var(--good)' }],
      note: {
        before: 'A prompt or model change gets shipped based on a handful of manual spot-checks — no systematic way to know if it actually helped or hurt.',
        after: 'A standing set of test cases gives a concrete, comparable number before and after every change — a regression is caught immediately.',
      },
    }),
    code: [{ lang: 'python', snippet: `eval_cases = load_eval_set("customer_support_v1.jsonl")  # 200 labeled examples\nresults = [agent.run(case.input) == case.expected for case in eval_cases]\naccuracy = sum(results) / len(results)\nassert accuracy >= 0.90, "regression — do not ship"` }],
    realWorld:
      'Every serious LLM application team maintains an eval suite the same way a software team maintains unit tests — the only real defense against a prompt that "felt better" but regressed.',
    pitfall:
      'An eval suite that only tests the happy path (or was written once and never updated) gives false confidence — it can pass 100% while missing exactly the edge cases production traffic surfaces.',
    fix:
      "Continuously add real production failures to the eval set as they're discovered, so the suite grows to reflect what actually goes wrong.",
  },
  {
    id: 'agi',
    section: 'ai',
    title: 'AGI (Artificial General Intelligence)',
    blurb: 'A hypothetical system that matches human-level performance across essentially any cognitive task, not just the narrow ones it was trained for.',
    tag: 'Frontier',
    Component: demo({
      command: 'generalize beyond training',
      before: [{ label: 'narrow AI: expert at chess, useless at cooking', color: 'var(--accent)' }],
      after: [{ label: 'AGI (hypothetical): learns cooking as readily as chess', sub: 'no task-specific retraining needed', color: 'var(--good)' }],
      note: {
        before: "Today's most capable systems still perform unevenly outside the tasks and data distributions they were built or trained around.",
        after: 'A true AGI would transfer competence across domains as flexibly as a human does — the defining, still-unmet bar.',
      },
    }),
    code: [{ lang: 'text', snippet: `# Narrow AI (today): trained for one domain\nchess_engine.play(board_state)       # superhuman\nchess_engine.cook_dinner()           # undefined — wrong tool entirely\n\n# AGI (hypothetical): same general intelligence, any domain\nagi.play(board_state)                # competent\nagi.cook_dinner()                    # also competent, no retraining` }],
    realWorld:
      "AGI is the explicit stated goal of labs like OpenAI and DeepMind — a research direction, not a shipped product, with genuine disagreement about how close current systems are to it.",
    pitfall:
      '"AGI" gets used loosely as a marketing term for "our latest very capable model" — treating a strong narrow-domain benchmark result as evidence of general intelligence overstates what was demonstrated.',
    fix:
      'Evaluate claims about "AGI-like" capability against genuine cross-domain generalization evidence, not performance on the specific benchmark a system was tuned for.',
  },
  {
    id: 'asi',
    section: 'ai',
    title: 'ASI (Artificial Superintelligence)',
    blurb: 'A hypothetical intelligence that substantially exceeds the best human performance across virtually every domain — the step beyond AGI.',
    tag: 'Frontier',
    Component: demo({
      command: 'exceed human performance everywhere',
      before: [{ label: 'AGI: matches top human experts', color: 'var(--accent)' }],
      after: [{ label: 'ASI (hypothetical): exceeds every expert, every domain, at once', color: 'var(--good)' }],
      note: {
        before: 'AGI, even fully realized, is defined relative to human-level competence — matching the best humans, not necessarily surpassing them by a wide margin.',
        after: 'ASI describes something categorically beyond that — decisively outperforming the best human specialists across essentially every field at once.',
      },
    }),
    code: [{ lang: 'text', snippet: `# AGI (hypothetical): human-level, general\nagi.solve(open_problem)   # comparable to a top human expert\n\n# ASI (hypothetical): far beyond human-level, general\nasi.solve(open_problem)   # solutions no human expert would have found` }],
    realWorld:
      'ASI is central to AI safety research (Bostrom\'s "Superintelligence", much of the alignment field) precisely because a system that outperforms humans at AI research itself could improve faster than humans can oversee.',
    pitfall:
      'Treating ASI as either "obviously imminent" or "obviously impossible" both skip past real uncertainty — credible researchers hold genuinely different timelines.',
    fix:
      'Engage with the range of expert opinion and the specific arguments (scaling trends, theoretical limits) rather than anchoring on the most dramatic or most dismissive take.',
  },
  {
    id: 'alignment',
    section: 'ai',
    title: 'Alignment',
    blurb: "Making an AI system's actual behavior match what its designers and users intended — a genuinely hard problem even before capability enters the picture.",
    tag: 'Frontier',
    Component: demo({
      command: 'align behavior with intent',
      before: [{ label: '"maximize user engagement"', sub: 'optimizes for outrage and addiction', color: 'var(--bad)' }],
      after: [{ label: '"maximize genuine user wellbeing"', sub: 'the actually-intended goal, harder to measure', color: 'var(--good)' }],
      note: {
        before: "A literal, measurable proxy objective gets optimized exactly as specified — and the specification turns out not to capture what was actually wanted.",
        after: "The real intent is harder to define and measure precisely, but it's what alignment work is trying to get a system to pursue.",
      },
    }),
    code: [{ lang: 'text', snippet: `# Misaligned: optimizes the literal metric\nreward = clicks + watch_time\n# -> learns outrage and addictive content maximize the metric\n\n# Aligned (much harder to specify): optimizes actual intent\nreward = long_term_user_wellbeing_and_satisfaction  # not directly measurable` }],
    realWorld:
      'Reward hacking in recommendation systems (optimizing engagement over wellbeing) is a small, already-observed version of the alignment problem — RLHF is one current, partial technique for narrowing the gap.',
    pitfall:
      "Assuming a model is aligned just because it behaves well on tested prompts ignores that alignment failures often show up precisely in situations testing didn't anticipate.",
    fix:
      'Test explicitly for edge cases and adversarial prompts, not just typical usage, and treat alignment as an ongoing property to monitor in production, not a one-time check.',
  },
  {
    id: 'scaling-laws',
    section: 'ai',
    title: 'Scaling Laws',
    blurb: 'Empirical relationships showing model performance improves predictably as parameters, training data, and compute all increase together.',
    tag: 'Frontier',
    Component: demo({
      command: 'scale up predictably',
      before: [{ label: '1B params, 50B tokens', sub: 'loss: 2.4', color: 'var(--accent)' }],
      after: [{ label: '10B params, 500B tokens (10x)', sub: 'loss: 1.9 — predicted by the scaling curve', color: 'var(--good)' }],
      note: {
        before: 'A smaller model at a given scale achieves a certain, measurable loss on held-out data.',
        after: 'Scaling parameters and data together by a predictable factor produces a loss improvement that follows a well-fit power-law curve.',
      },
    }),
    code: [{ lang: 'text', snippet: `# Chinchilla scaling law (Hoffmann et al.): roughly,\n# loss(N, D) ~ predictable power-law in params (N) and tokens (D)\n# -> for compute-optimal training, N and D should scale together` }],
    realWorld:
      "The Kaplan (2020) and Chinchilla (2022) scaling law papers directly shaped how every major lab since allocates training compute — how many parameters vs how much data isn't guesswork, it's read off the curve.",
    pitfall:
      "Scaling laws describe average trends across many measured runs — they don't guarantee any specific new model hits the curve exactly, and gains can run into diminishing returns or data limits in practice.",
    fix:
      'Treat scaling-law predictions as a strong prior to plan around, not a guarantee for a specific run — validate against actual measured loss during training.',
  },
  {
    id: 'emergent-abilities',
    section: 'ai',
    title: 'Emergent Abilities',
    blurb: 'Capabilities that appear suddenly at a certain model scale, essentially absent in smaller models trained the same way.',
    tag: 'Frontier',
    Component: demo({
      command: 'cross the scale threshold',
      before: [{ label: '7B model: near-random on multi-step arithmetic', color: 'var(--bad)' }],
      after: [{ label: '70B model (same training): solves it reliably', sub: "the ability wasn't there, then it was", color: 'var(--good)' }],
      note: {
        before: 'A smaller model, trained the same way, performs close to chance on a task requiring several chained reasoning steps.',
        after: 'Cross a certain scale and the exact same kind of task is suddenly handled reliably — closer to a threshold effect than a gradual ramp.',
      },
    }),
    code: [{ lang: 'text', snippet: `# Same training recipe, different scale\nmodel_7b.solve("If a train travels 60mph for 2.5 hours, ...")   # ~random\nmodel_70b.solve("If a train travels 60mph for 2.5 hours, ...")  # reliably correct\n# the capability appeared abruptly, not as a smooth ramp` }],
    realWorld:
      'Chain-of-thought reasoning, multi-step arithmetic, and certain instruction-following behaviors were all documented as emergent — barely present in smaller models, suddenly reliable past a certain scale.',
    pitfall:
      'Some claimed "emergent abilities" turn out to be an artifact of the metric used (a discontinuous pass/fail score can look like a sudden jump where a continuous score shows smooth improvement).',
    fix:
      'Check whether an apparent emergent jump holds up under a continuous, more granular scoring metric before concluding the capability itself appeared discontinuously.',
  },
]
