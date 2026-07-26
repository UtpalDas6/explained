import TwoPointers from '../concepts/dsa/TwoPointers.jsx'
import SlidingWindow from '../concepts/dsa/SlidingWindow.jsx'
import LinkedListViz from '../concepts/dsa/LinkedListViz.jsx'
import StackQueue from '../concepts/dsa/StackQueue.jsx'
import BinarySearch from '../concepts/dsa/BinarySearch.jsx'
import BstViz from '../concepts/dsa/BstViz.jsx'
import HeapViz from '../concepts/dsa/HeapViz.jsx'
import GraphBfsDfs from '../concepts/dsa/GraphBfsDfs.jsx'
import SortingViz from '../concepts/dsa/SortingViz.jsx'
import DpViz from '../concepts/dsa/DpViz.jsx'
import Knapsack01 from '../concepts/dsa/Knapsack01.jsx'
import LisViz from '../concepts/dsa/LisViz.jsx'
import CoinChangeViz from '../concepts/dsa/CoinChangeViz.jsx'
import MatrixChainViz from '../concepts/dsa/MatrixChainViz.jsx'
import UnionFind from '../concepts/dsa/UnionFind.jsx'
import TrieViz from '../concepts/dsa/TrieViz.jsx'
import TopoSortViz from '../concepts/dsa/TopoSortViz.jsx'
import DijkstraViz from '../concepts/dsa/DijkstraViz.jsx'
import BacktrackingViz from '../concepts/dsa/BacktrackingViz.jsx'
import SegmentTreeViz from '../concepts/dsa/SegmentTreeViz.jsx'
import HashingViz from '../concepts/dsa/HashingViz.jsx'
import IntervalsViz from '../concepts/dsa/IntervalsViz.jsx'
import PrefixSumViz from '../concepts/dsa/PrefixSumViz.jsx'
import BitManipulationViz from '../concepts/dsa/BitManipulationViz.jsx'
import LruCacheViz from '../concepts/dsa/LruCacheViz.jsx'
import BinaryTreeDfsViz from '../concepts/dsa/BinaryTreeDfsViz.jsx'
import GreedyStockViz from '../concepts/dsa/GreedyStockViz.jsx'
import TwoHeapsMedianViz from '../concepts/dsa/TwoHeapsMedianViz.jsx'

// Registry for the /ds_algo section, mirrors data/concepts.js but each entry
// carries a `code` array (python + js tabs) and a `leetcode` list instead of
// a single snippet, since the whole point here is "how would I use this in
// an interview problem" rather than "how does this show up in prod infra".
export const dsaConcepts = [
  {
    id: 'two-pointers',
    section: 'dsa',
    title: 'Two Pointers',
    blurb: 'Two indices walk toward each other across a sorted array, each step eliminating one end.',
    tag: 'O(n)',
    Component: TwoPointers,
    code: [
      {
        lang: 'python',
        snippet: `def two_sum_sorted(arr, target):
    l, r = 0, len(arr) - 1
    while l < r:
        s = arr[l] + arr[r]
        if s == target:
            return [l, r]
        if s < target:
            l += 1
        else:
            r -= 1
    return None`,
      },
      {
        lang: 'javascript',
        snippet: `function twoSumSorted(arr, target) {
  let l = 0, r = arr.length - 1
  while (l < r) {
    const sum = arr[l] + arr[r]
    if (sum === target) return [l, r]
    if (sum < target) l++
    else r--
  }
  return null
}`,
      },
    ],
    leetcode: [
      { title: 'Two Sum II - Input Array Is Sorted', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', difficulty: 'Easy', companies: ['Amazon'] },
      { title: '3Sum', url: 'https://leetcode.com/problems/3sum/', difficulty: 'Medium', companies: ['Meta'] },
      { title: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water/', difficulty: 'Medium', companies: ['Google'] },
      { title: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water/', difficulty: 'Hard', companies: ['Google', 'Amazon'] },
      { title: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome/', difficulty: 'Easy', companies: ['Meta'] },
    ],
    realWorld:
      'Reach for this whenever the brute force is a nested loop over a sorted or monotonic sequence: merging sorted arrays, palindrome checks, trapping rain water, and cycle detection (Floyd\'s slow/fast pointer) are all this same shape.',
  },
  {
    id: 'sliding-window',
    section: 'dsa',
    title: 'Sliding Window',
    blurb: 'A window of fixed or variable size slides across an array, updating incrementally instead of resumming.',
    tag: 'O(n)',
    Component: SlidingWindow,
    code: [
      {
        lang: 'python',
        snippet: `def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])
    best = window_sum
    for end in range(k, len(arr)):
        window_sum += arr[end] - arr[end - k]
        best = max(best, window_sum)
    return best`,
      },
      {
        lang: 'javascript',
        snippet: `function maxSumSubarray(arr, k) {
  let windowSum = arr.slice(0, k).reduce((a, b) => a + b, 0)
  let best = windowSum
  for (let end = k; end < arr.length; end++) {
    windowSum += arr[end] - arr[end - k]
    best = Math.max(best, windowSum)
  }
  return best
}`,
      },
    ],
    leetcode: [
      { title: 'Maximum Average Subarray I', url: 'https://leetcode.com/problems/maximum-average-subarray-i/', difficulty: 'Easy' },
      { title: 'Longest Substring Without Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', difficulty: 'Medium', companies: ['Meta', 'Google', 'Amazon'] },
      { title: 'Minimum Window Substring', url: 'https://leetcode.com/problems/minimum-window-substring/', difficulty: 'Hard', companies: ['Meta', 'Google'] },
    ],
    realWorld:
      'The go-to pattern whenever a problem asks for the best/longest/shortest contiguous run — rate limiters (requests in the last N seconds) are a sliding window over time instead of over an array.',
  },
  {
    id: 'linked-list',
    section: 'dsa',
    title: 'Linked List Reversal',
    blurb: 'Walk the list once, flipping each node\'s next pointer to face backward.',
    tag: 'O(n)',
    Component: LinkedListViz,
    code: [
      {
        lang: 'python',
        snippet: `class ListNode:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      },
      {
        lang: 'javascript',
        snippet: `function reverseList(head) {
  let prev = null
  let curr = head
  while (curr) {
    const next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}`,
      },
    ],
    leetcode: [
      { title: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/', difficulty: 'Easy', companies: ['Google'] },
      { title: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/', difficulty: 'Easy', companies: ['Google'] },
      { title: 'Merge Two Sorted Lists', url: 'https://leetcode.com/problems/merge-two-sorted-lists/', difficulty: 'Easy' },
      { title: 'Add Two Numbers', url: 'https://leetcode.com/problems/add-two-numbers/', difficulty: 'Medium', companies: ['Meta'] },
      { title: 'Copy List with Random Pointer', url: 'https://leetcode.com/problems/copy-list-with-random-pointer/', difficulty: 'Medium', companies: ['Meta'] },
    ],
    realWorld:
      'Shows up any time you need O(1)-space in-place mutation of a chain of references: undo/redo history, browser back/forward stacks, and LRU cache internals (a doubly linked list) all lean on the same pointer-rewiring instinct.',
  },
  {
    id: 'stack-queue',
    section: 'dsa',
    title: 'Stack & Queue',
    blurb: 'LIFO vs FIFO — same "collection of items", opposite rule for what comes out next.',
    tag: 'O(1) per op',
    Component: StackQueue,
    code: [
      {
        lang: 'python',
        snippet: `def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack`,
      },
      {
        lang: 'javascript',
        snippet: `function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' }
  const stack = []
  for (const ch of s) {
    if (ch in pairs) {
      if (stack.pop() !== pairs[ch]) return false
    } else {
      stack.push(ch)
    }
  }
  return stack.length === 0
}`,
      },
    ],
    leetcode: [
      { title: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', difficulty: 'Easy', companies: ['Amazon'] },
      { title: 'Implement Queue using Stacks', url: 'https://leetcode.com/problems/implement-queue-using-stacks/', difficulty: 'Easy' },
      { title: 'Daily Temperatures', url: 'https://leetcode.com/problems/daily-temperatures/', difficulty: 'Medium' },
    ],
    realWorld:
      'A stack is what tracks function calls (and recursion depth), undo history, and DFS. A queue is what backs a task/message queue, print spoolers, and BFS — the "explore order" of a traversal is really just a choice of which of these two backs it.',
  },
  {
    id: 'binary-search',
    section: 'dsa',
    title: 'Binary Search',
    blurb: 'Halve the search range every comparison instead of scanning linearly.',
    tag: 'O(log n)',
    Component: BinarySearch,
    code: [
      {
        lang: 'python',
        snippet: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
      },
      {
        lang: 'javascript',
        snippet: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}`,
      },
    ],
    leetcode: [
      { title: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/', difficulty: 'Easy' },
      { title: 'Search in Rotated Sorted Array', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', difficulty: 'Medium', companies: ['Meta'] },
      { title: 'Find First and Last Position of Element in Sorted Array', url: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/', difficulty: 'Medium', companies: ['Meta'] },
    ],
    realWorld:
      'Anywhere the search space is monotonic, not just a literal sorted array — "binary search on the answer" solves optimization problems like minimizing a max/maximizing a min by binary-searching over possible answers and checking feasibility.',
  },
  {
    id: 'bst',
    section: 'dsa',
    title: 'Binary Search Tree',
    blurb: 'Every node keeps left subtree smaller, right subtree bigger — search and insert both walk one path.',
    tag: 'O(log n)*',
    Component: BstViz,
    code: [
      {
        lang: 'python',
        snippet: `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if root is None:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    elif val > root.val:
        root.right = insert(root.right, val)
    return root

def search(root, target):
    node = root
    while node:
        if node.val == target:
            return node
        node = node.left if target < node.val else node.right
    return None`,
      },
      {
        lang: 'javascript',
        snippet: `class TreeNode {
  constructor(val) {
    this.val = val
    this.left = null
    this.right = null
  }
}

function insert(root, val) {
  if (!root) return new TreeNode(val)
  if (val < root.val) root.left = insert(root.left, val)
  else if (val > root.val) root.right = insert(root.right, val)
  return root
}

function search(root, target) {
  let node = root
  while (node) {
    if (node.val === target) return node
    node = target < node.val ? node.left : node.right
  }
  return null
}`,
      },
    ],
    leetcode: [
      { title: 'Validate Binary Search Tree', url: 'https://leetcode.com/problems/validate-binary-search-tree/', difficulty: 'Medium' },
      { title: 'Insert into a Binary Search Tree', url: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/', difficulty: 'Medium' },
      { title: 'Lowest Common Ancestor of a Binary Search Tree', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', difficulty: 'Medium', companies: ['Google'] },
    ],
    realWorld:
      '*O(log n) only holds if the tree stays balanced — database indexes (B-trees are a wide BST) rebalance on every write for exactly this reason, and in-memory ordered maps (Java TreeMap, C++ std::map) are red-black trees under the hood.',
  },
  {
    id: 'heap',
    section: 'dsa',
    title: 'Heap / Priority Queue',
    blurb: 'A complete binary tree stored flat in an array, where every parent is smaller (or larger) than its children.',
    tag: 'O(log n)',
    Component: HeapViz,
    code: [
      {
        lang: 'python',
        snippet: `import heapq

def kth_largest(nums, k):
    heap = []
    for n in nums:
        heapq.heappush(heap, n)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,
      },
      {
        lang: 'javascript',
        snippet: `// JS has no built-in heap — a minimal one, since interviews expect you to know why:
class MinHeap {
  constructor() { this.data = [] }
  push(val) {
    this.data.push(val)
    let i = this.data.length - 1
    while (i > 0) {
      const p = Math.floor((i - 1) / 2)
      if (this.data[p] <= this.data[i]) break
      ;[this.data[p], this.data[i]] = [this.data[i], this.data[p]]
      i = p
    }
  }
  pop() {
    const top = this.data[0]
    const last = this.data.pop()
    if (this.data.length) {
      this.data[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1, r = 2 * i + 2
        let smallest = i
        if (l < this.data.length && this.data[l] < this.data[smallest]) smallest = l
        if (r < this.data.length && this.data[r] < this.data[smallest]) smallest = r
        if (smallest === i) break
        ;[this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]]
        i = smallest
      }
    }
    return top
  }
}

function kthLargest(nums, k) {
  const heap = new MinHeap()
  for (const n of nums) {
    heap.push(n)
    if (heap.data.length > k) heap.pop()
  }
  return heap.data[0]
}`,
      },
    ],
    leetcode: [
      { title: 'Kth Largest Element in an Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', difficulty: 'Medium', companies: ['Google'] },
      { title: 'Top K Frequent Elements', url: 'https://leetcode.com/problems/top-k-frequent-elements/', difficulty: 'Medium', companies: ['Google', 'Amazon'] },
      { title: 'Merge k Sorted Lists', url: 'https://leetcode.com/problems/merge-k-sorted-lists/', difficulty: 'Hard', companies: ['Google', 'Amazon'] },
    ],
    realWorld:
      'The engine behind any "top k" / "k closest" / "k most frequent" question, Dijkstra\'s shortest path (always expand the closest unvisited node), and OS task schedulers picking the next highest-priority job.',
  },
  {
    id: 'graph-bfs-dfs',
    section: 'dsa',
    title: 'Graph BFS / DFS',
    blurb: 'Same traversal skeleton, opposite frontier: a queue explores level by level, a stack dives depth-first.',
    tag: 'O(V+E)',
    Component: GraphBfsDfs,
    code: [
      {
        lang: 'python',
        snippet: `from collections import deque

def bfs(graph, start):
    visited = {start}
    order = []
    queue = deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order

def dfs(graph, start, visited=None, order=None):
    if visited is None:
        visited, order = set(), []
    if start in visited:
        return order
    visited.add(start)
    order.append(start)
    for neighbor in graph[start]:
        dfs(graph, neighbor, visited, order)
    return order`,
      },
      {
        lang: 'javascript',
        snippet: `function bfs(graph, start) {
  const visited = new Set([start])
  const order = []
  const queue = [start]
  while (queue.length) {
    const node = queue.shift()
    order.push(node)
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }
  return order
}

function dfs(graph, start, visited = new Set(), order = []) {
  if (visited.has(start)) return order
  visited.add(start)
  order.push(start)
  for (const neighbor of graph[start]) dfs(graph, neighbor, visited, order)
  return order
}`,
      },
    ],
    leetcode: [
      { title: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/', difficulty: 'Medium', companies: ['Meta', 'Google', 'Amazon'] },
      { title: 'Course Schedule', url: 'https://leetcode.com/problems/course-schedule/', difficulty: 'Medium', companies: ['Google'] },
      { title: 'Word Ladder', url: 'https://leetcode.com/problems/word-ladder/', difficulty: 'Hard', companies: ['Google'] },
      { title: 'Clone Graph', url: 'https://leetcode.com/problems/clone-graph/', difficulty: 'Medium', companies: ['Meta', 'Google'] },
    ],
    realWorld:
      'BFS is how "shortest path in an unweighted graph" and web crawlers exploring by link-depth work. DFS is how dependency resolution (topological sort), cycle detection, and maze/backtracking solvers work.',
  },
  {
    id: 'sorting',
    section: 'dsa',
    title: 'Sorting: Quick vs Merge',
    blurb: 'Quick sort partitions around a pivot in place; merge sort splits and merges, always stable.',
    tag: 'O(n log n)',
    Component: SortingViz,
    code: [
      {
        lang: 'python',
        snippet: `def quicksort(arr, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1
    if lo >= hi:
        return arr
    pivot = arr[hi]
    i = lo
    for j in range(lo, hi):
        if arr[j] < pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[hi] = arr[hi], arr[i]
    quicksort(arr, lo, i - 1)
    quicksort(arr, i + 1, hi)
    return arr`,
      },
      {
        lang: 'javascript',
        snippet: `function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  const merged = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    merged.push(left[i] <= right[j] ? left[i++] : right[j++])
  }
  return [...merged, ...left.slice(i), ...right.slice(j)]
}`,
      },
    ],
    leetcode: [
      { title: 'Sort an Array', url: 'https://leetcode.com/problems/sort-an-array/', difficulty: 'Medium' },
      { title: 'Merge Intervals', url: 'https://leetcode.com/problems/merge-intervals/', difficulty: 'Medium', companies: ['Meta', 'Google', 'Amazon'] },
      { title: 'Kth Largest Element in an Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', difficulty: 'Medium', companies: ['Google'] },
    ],
    realWorld:
      'Quick sort (in place, cache-friendly) is what most language standard sorts use for primitives; merge sort (stable, predictable O(n log n)) is what they fall back to for objects where stability matters — Python\'s Timsort and Java\'s Arrays.sort(Object[]) are merge-sort derivatives.',
  },
  {
    id: 'dp-lcs',
    section: 'dsa',
    title: 'Dynamic Programming: LCS',
    blurb: 'Fill a table where each cell reuses two already-solved subproblems instead of recomputing them.',
    tag: 'O(n·m)',
    Component: DpViz,
    code: [
      {
        lang: 'python',
        snippet: `def longest_common_subsequence(s1, s2):
    n, m = len(s1), len(s2)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]`,
      },
      {
        lang: 'javascript',
        snippet: `function longestCommonSubsequence(s1, s2) {
  const n = s1.length, m = s2.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = s1[i - 1] === s2[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[n][m]
}`,
      },
    ],
    leetcode: [
      { title: 'Longest Common Subsequence', url: 'https://leetcode.com/problems/longest-common-subsequence/', difficulty: 'Medium' },
      { title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/', difficulty: 'Easy' },
      { title: 'Coin Change', url: 'https://leetcode.com/problems/coin-change/', difficulty: 'Medium', companies: ['Google'] },
      { title: 'Edit Distance', url: 'https://leetcode.com/problems/edit-distance/', difficulty: 'Hard', companies: ['Google'] },
      { title: 'Word Break', url: 'https://leetcode.com/problems/word-break/', difficulty: 'Medium', companies: ['Meta', 'Google'] },
      { title: 'Decode Ways', url: 'https://leetcode.com/problems/decode-ways/', difficulty: 'Medium', companies: ['Meta', 'Google'] },
    ],
    realWorld:
      '`git diff` and `diff` itself compute an LCS/edit-distance table to find the minimal set of line changes. The same table-filling idea (identify overlapping subproblems, cache them) is the whole trick behind every DP problem, not just this one.',
  },
  {
    id: 'knapsack-01',
    section: 'dsa',
    title: '0/1 Knapsack',
    blurb: 'Every item is a binary choice — take it whole or leave it — under a fixed capacity.',
    tag: 'O(n·W)',
    Component: Knapsack01,
    code: [
      {
        lang: 'python',
        snippet: `def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
    return dp[n][capacity]`,
      },
      {
        lang: 'javascript',
        snippet: `function knapsack(weights, values, capacity) {
  const n = weights.length
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
      }
    }
  }
  return dp[n][capacity]
}`,
      },
    ],
    leetcode: [
      { title: 'Partition Equal Subset Sum', url: 'https://leetcode.com/problems/partition-equal-subset-sum/', difficulty: 'Medium' },
      { title: 'Target Sum', url: 'https://leetcode.com/problems/target-sum/', difficulty: 'Medium' },
      { title: 'Last Stone Weight II', url: 'https://leetcode.com/problems/last-stone-weight-ii/', difficulty: 'Medium' },
    ],
    realWorld:
      'The 0/1 choice — take an item whole or leave it — is the backbone of any budget-constrained selection problem: portfolio selection under a budget, resource allocation, and every subset-sum variant reduce to this same table.',
  },
  {
    id: 'lis',
    section: 'dsa',
    title: 'Longest Increasing Subsequence',
    blurb: 'dp[i] = the longest increasing run ending at i, built from every earlier index that could extend it.',
    tag: 'O(n²)',
    Component: LisViz,
    code: [
      {
        lang: 'python',
        snippet: `def length_of_lis(nums):
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp) if dp else 0`,
      },
      {
        lang: 'javascript',
        snippet: `function lengthOfLIS(nums) {
  const dp = Array(nums.length).fill(1)
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1)
    }
  }
  return Math.max(...dp, 0)
}`,
      },
    ],
    leetcode: [
      { title: 'Longest Increasing Subsequence', url: 'https://leetcode.com/problems/longest-increasing-subsequence/', difficulty: 'Medium', companies: ['Google'] },
      { title: 'Russian Doll Envelopes', url: 'https://leetcode.com/problems/russian-doll-envelopes/', difficulty: 'Hard' },
      { title: 'Maximum Length of Pair Chain', url: 'https://leetcode.com/problems/maximum-length-of-pair-chain/', difficulty: 'Medium' },
    ],
    realWorld:
      'Same shape as diff-style version comparison (the longest run of unchanged, ordered items) and scheduling ("longest chain of compatible tasks"). The O(n log n) patience-sorting variant is the standard follow-up once you\'ve shown this O(n²) table.',
  },
  {
    id: 'coin-change',
    section: 'dsa',
    title: 'Coin Change (Min Coins)',
    blurb: 'Fill dp[amount] bottom-up — greedy picks the biggest coin first and can be provably wrong.',
    tag: 'O(amount·coins)',
    Component: CoinChangeViz,
    code: [
      {
        lang: 'python',
        snippet: `def coin_change(coins, amount):
    dp = [0] + [float('inf')] * amount
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a:
                dp[a] = min(dp[a], dp[a - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
      },
      {
        lang: 'javascript',
        snippet: `function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a) dp[a] = Math.min(dp[a], dp[a - coin] + 1)
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}`,
      },
    ],
    leetcode: [
      { title: 'Coin Change', url: 'https://leetcode.com/problems/coin-change/', difficulty: 'Medium', companies: ['Google'] },
      { title: 'Coin Change II', url: 'https://leetcode.com/problems/coin-change-ii/', difficulty: 'Medium' },
      { title: 'Perfect Squares', url: 'https://leetcode.com/problems/perfect-squares/', difficulty: 'Medium' },
    ],
    realWorld:
      'Making change is the canonical counterexample to "just be greedy" — coins [1,4,5] for amount 8 need 2 coins (4+4), not the 4 a greedy biggest-first pick gives. Any "fewest/most ways to reach a target from a fixed set of pieces" problem (perfect squares, dice combinations, stair-climbing with variable steps) is this same 1D table.',
  },
  {
    id: 'matrix-chain',
    section: 'dsa',
    title: 'Matrix Chain Multiplication',
    blurb: 'Try every split point between two matrices and keep the cheapest — an interval DP over sub-chains.',
    tag: 'O(n³)',
    Component: MatrixChainViz,
    code: [
      {
        lang: 'python',
        snippet: `def matrix_chain_order(dims):
    n = len(dims) - 1
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):
        for i in range(1, n - length + 2):
            j = i + length - 1
            dp[i][j] = float('inf')
            for k in range(i, j):
                cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j]
                dp[i][j] = min(dp[i][j], cost)
    return dp[1][n]`,
      },
      {
        lang: 'javascript',
        snippet: `function matrixChainOrder(dims) {
  const n = dims.length - 1
  const dp = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  for (let len = 2; len <= n; len++) {
    for (let i = 1; i <= n - len + 1; i++) {
      const j = i + len - 1
      dp[i][j] = Infinity
      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j]
        dp[i][j] = Math.min(dp[i][j], cost)
      }
    }
  }
  return dp[1][n]
}`,
      },
    ],
    leetcode: [
      { title: 'Minimum Cost to Merge Stones', url: 'https://leetcode.com/problems/minimum-cost-to-merge-stones/', difficulty: 'Hard' },
      { title: 'Burst Balloons', url: 'https://leetcode.com/problems/burst-balloons/', difficulty: 'Hard' },
      { title: 'Unique Binary Search Trees', url: 'https://leetcode.com/problems/unique-binary-search-trees/', difficulty: 'Medium' },
    ],
    realWorld:
      'The "try every split point k" interval-DP pattern here is the same one behind Burst Balloons and counting distinct BST shapes — anywhere the cost of combining a range depends on where you split it first.',
  },
  {
    id: 'union-find',
    section: 'dsa',
    title: 'Union-Find (DSU)',
    blurb: 'A forest of trees where every node can point straight at its component\'s root, thanks to path compression.',
    tag: 'O(α(n))',
    Component: UnionFind,
    code: [
      {
        lang: 'python',
        snippet: `class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]  # path halving
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        return True`,
      },
      {
        lang: 'javascript',
        snippet: `class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i)
    this.size = Array(n).fill(1)
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]] // path halving
      x = this.parent[x]
    }
    return x
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b)
    if (ra === rb) return false
    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra]
    this.parent[rb] = ra
    this.size[ra] += this.size[rb]
    return true
  }
}`,
      },
    ],
    leetcode: [
      { title: 'Number of Provinces', url: 'https://leetcode.com/problems/number-of-provinces/', difficulty: 'Medium' },
      { title: 'Redundant Connection', url: 'https://leetcode.com/problems/redundant-connection/', difficulty: 'Medium' },
      { title: 'Accounts Merge', url: 'https://leetcode.com/problems/accounts-merge/', difficulty: 'Medium', companies: ['Meta'] },
    ],
    realWorld:
      'Kruskal\'s minimum spanning tree algorithm uses union-find to reject any edge that would close a cycle. It\'s also how "friend circles"-style connected-components-with-updates problems and offline dynamic connectivity queries avoid rebuilding a graph from scratch on every query.',
  },
  {
    id: 'trie',
    section: 'dsa',
    title: 'Trie (Prefix Tree)',
    blurb: 'Words that share a prefix share nodes — insert and search both walk one path, one character at a time.',
    tag: 'O(word length)',
    Component: TrieViz,
    code: [
      {
        lang: 'python',
        snippet: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_end = True

    def _walk(self, s):
        node = self.root
        for ch in s:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        return self._walk(prefix) is not None`,
      },
      {
        lang: 'javascript',
        snippet: `class TrieNode {
  constructor() {
    this.children = {}
    this.isEnd = false
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode()
  }
  insert(word) {
    let node = this.root
    for (const ch of word) {
      node.children[ch] ??= new TrieNode()
      node = node.children[ch]
    }
    node.isEnd = true
  }
  _walk(s) {
    let node = this.root
    for (const ch of s) {
      if (!node.children[ch]) return null
      node = node.children[ch]
    }
    return node
  }
  search(word) {
    const node = this._walk(word)
    return node !== null && node.isEnd
  }
  startsWith(prefix) {
    return this._walk(prefix) !== null
  }
}`,
      },
    ],
    leetcode: [
      { title: 'Implement Trie (Prefix Tree)', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/', difficulty: 'Medium' },
      { title: 'Word Search II', url: 'https://leetcode.com/problems/word-search-ii/', difficulty: 'Hard' },
      { title: 'Design Add and Search Words Data Structure', url: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', difficulty: 'Medium' },
    ],
    realWorld:
      'Autocomplete and spell-checkers are the textbook use — a trie answers "does anything start with this prefix" in time proportional to the prefix length, regardless of dictionary size. IP routing tables use the same structure (a bitwise trie) for longest-prefix matching.',
  },
  {
    id: 'topo-sort',
    section: 'dsa',
    title: 'Topological Sort',
    blurb: "Kahn's algorithm: repeatedly emit a node with zero remaining in-degree, then decrement its neighbors'.",
    tag: 'O(V+E)',
    Component: TopoSortViz,
    code: [
      {
        lang: 'python',
        snippet: `from collections import deque

def topo_sort(num_nodes, edges):
    adj = [[] for _ in range(num_nodes)]
    indeg = [0] * num_nodes
    for a, b in edges:
        adj[a].append(b)
        indeg[b] += 1
    queue = deque(n for n in range(num_nodes) if indeg[n] == 0)
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for nb in adj[node]:
            indeg[nb] -= 1
            if indeg[nb] == 0:
                queue.append(nb)
    return order if len(order) == num_nodes else None  # None = cycle`,
      },
      {
        lang: 'javascript',
        snippet: `function topoSort(numNodes, edges) {
  const adj = Array.from({ length: numNodes }, () => [])
  const indeg = Array(numNodes).fill(0)
  for (const [a, b] of edges) {
    adj[a].push(b)
    indeg[b]++
  }
  const queue = []
  for (let n = 0; n < numNodes; n++) if (indeg[n] === 0) queue.push(n)
  const order = []
  while (queue.length) {
    const node = queue.shift()
    order.push(node)
    for (const nb of adj[node]) {
      indeg[nb]--
      if (indeg[nb] === 0) queue.push(nb)
    }
  }
  return order.length === numNodes ? order : null // null = cycle
}`,
      },
    ],
    leetcode: [
      { title: 'Course Schedule', url: 'https://leetcode.com/problems/course-schedule/', difficulty: 'Medium', companies: ['Google'] },
      { title: 'Course Schedule II', url: 'https://leetcode.com/problems/course-schedule-ii/', difficulty: 'Medium' },
      { title: 'Alien Dictionary', url: 'https://leetcode.com/problems/alien-dictionary/', difficulty: 'Hard', companies: ['Meta', 'Amazon'] },
    ],
    realWorld:
      'Build systems compiling files in dependency order, package managers resolving install order, and spreadsheet formula recalculation all need a valid ordering of a dependency DAG — exactly what topological sort produces, with cycle detection (an incomplete order) as a free side effect.',
  },
  {
    id: 'dijkstra',
    section: 'dsa',
    title: "Dijkstra's Shortest Path",
    blurb: 'Always finalize the closest unvisited node next, then relax its neighbors — BFS with weights.',
    tag: 'O((V+E) log V)',
    Component: DijkstraViz,
    code: [
      {
        lang: 'python',
        snippet: `import heapq

def dijkstra(adj, start):
    dist = {node: float('inf') for node in adj}
    dist[start] = 0
    pq = [(0, start)]
    visited = set()
    while pq:
        d, node = heapq.heappop(pq)
        if node in visited:
            continue
        visited.add(node)
        for neighbor, weight in adj[node]:
            if d + weight < dist[neighbor]:
                dist[neighbor] = d + weight
                heapq.heappush(pq, (dist[neighbor], neighbor))
    return dist`,
      },
      {
        lang: 'javascript',
        snippet: `// Linear scan for the min instead of a heap, to keep this dependency-free —
// swap in the MinHeap from the Heap concept for the full O((V+E) log V).
function dijkstra(adj, start) {
  const dist = Object.fromEntries(Object.keys(adj).map((n) => [n, Infinity]))
  dist[start] = 0
  const visited = new Set()
  while (visited.size < Object.keys(adj).length) {
    let u = null, best = Infinity
    for (const n in dist) {
      if (!visited.has(n) && dist[n] < best) { best = dist[n]; u = n }
    }
    if (u === null) break
    visited.add(u)
    for (const [v, w] of adj[u]) {
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w
    }
  }
  return dist
}`,
      },
    ],
    leetcode: [
      { title: 'Network Delay Time', url: 'https://leetcode.com/problems/network-delay-time/', difficulty: 'Medium' },
      { title: 'Path with Maximum Probability', url: 'https://leetcode.com/problems/path-with-maximum-probability/', difficulty: 'Medium' },
      { title: 'Cheapest Flights Within K Stops', url: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', difficulty: 'Medium' },
    ],
    realWorld:
      'GPS routing and network routing protocols (OSPF) compute shortest paths this way. Any "cheapest/fastest path with weighted edges" interview question is Dijkstra — unless edges can be negative, in which case it\'s Bellman-Ford instead.',
  },
  {
    id: 'backtracking-nqueens',
    section: 'dsa',
    title: 'Backtracking: N-Queens',
    blurb: 'Try a column, recurse to the next row; if every column conflicts, undo and back up.',
    tag: 'O(n!) worst case',
    Component: BacktrackingViz,
    code: [
      {
        lang: 'python',
        snippet: `def solve_n_queens(n):
    solutions = []
    cols = [-1] * n

    def is_safe(row, col):
        for r in range(row):
            c = cols[r]
            if c == col or abs(c - col) == abs(r - row):
                return False
        return True

    def place(row):
        if row == n:
            solutions.append(cols[:])
            return
        for col in range(n):
            if is_safe(row, col):
                cols[row] = col
                place(row + 1)
                cols[row] = -1

    place(0)
    return solutions`,
      },
      {
        lang: 'javascript',
        snippet: `function solveNQueens(n) {
  const solutions = []
  const cols = Array(n).fill(-1)

  function isSafe(row, col) {
    for (let r = 0; r < row; r++) {
      const c = cols[r]
      if (c === col || Math.abs(c - col) === Math.abs(r - row)) return false
    }
    return true
  }

  function place(row) {
    if (row === n) {
      solutions.push([...cols])
      return
    }
    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        cols[row] = col
        place(row + 1)
        cols[row] = -1
      }
    }
  }

  place(0)
  return solutions
}`,
      },
    ],
    leetcode: [
      { title: 'N-Queens', url: 'https://leetcode.com/problems/n-queens/', difficulty: 'Hard' },
      { title: 'Subsets', url: 'https://leetcode.com/problems/subsets/', difficulty: 'Medium', companies: ['Meta'] },
      { title: 'Permutations', url: 'https://leetcode.com/problems/permutations/', difficulty: 'Medium', companies: ['Meta'] },
      { title: 'Word Search', url: 'https://leetcode.com/problems/word-search/', difficulty: 'Medium', companies: ['Meta'] },
    ],
    realWorld:
      'Every "generate all X" or "does an arrangement exist satisfying these constraints" problem — Sudoku solvers, subset/permutation generation, word search on a grid — is backtracking: try a choice, recurse, undo if it leads nowhere.',
  },
  {
    id: 'segment-tree',
    section: 'dsa',
    title: 'Segment Tree',
    blurb: 'Each node caches the sum of its range, so a query only has to touch O(log n) of them.',
    tag: 'O(log n)',
    Component: SegmentTreeViz,
    code: [
      {
        lang: 'python',
        snippet: `class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (2 * self.n)
        for i, v in enumerate(arr):
            self.tree[self.n + i] = v
        for i in range(self.n - 1, 0, -1):
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def update(self, i, val):
        i += self.n
        self.tree[i] = val
        while i > 1:
            i //= 2
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def query(self, l, r):  # sum of [l, r)
        total = 0
        l += self.n
        r += self.n
        while l < r:
            if l & 1:
                total += self.tree[l]
                l += 1
            if r & 1:
                r -= 1
                total += self.tree[r]
            l //= 2
            r //= 2
        return total`,
      },
      {
        lang: 'javascript',
        snippet: `class SegmentTree {
  constructor(arr) {
    this.n = arr.length
    this.tree = Array(2 * this.n).fill(0)
    for (let i = 0; i < this.n; i++) this.tree[this.n + i] = arr[i]
    for (let i = this.n - 1; i > 0; i--) this.tree[i] = this.tree[2 * i] + this.tree[2 * i + 1]
  }
  update(i, val) {
    i += this.n
    this.tree[i] = val
    while (i > 1) {
      i = Math.floor(i / 2)
      this.tree[i] = this.tree[2 * i] + this.tree[2 * i + 1]
    }
  }
  query(l, r) { // sum of [l, r)
    let total = 0
    l += this.n
    r += this.n
    while (l < r) {
      if (l & 1) total += this.tree[l++]
      if (r & 1) total += this.tree[--r]
      l = Math.floor(l / 2)
      r = Math.floor(r / 2)
    }
    return total
  }
}`,
      },
    ],
    leetcode: [
      { title: 'Range Sum Query - Mutable', url: 'https://leetcode.com/problems/range-sum-query-mutable/', difficulty: 'Medium', companies: ['Google'] },
      { title: 'Count of Smaller Numbers After Self', url: 'https://leetcode.com/problems/count-of-smaller-numbers-after-self/', difficulty: 'Hard' },
      { title: 'The Skyline Problem', url: 'https://leetcode.com/problems/the-skyline-problem/', difficulty: 'Hard' },
    ],
    realWorld:
      'Anywhere you need range queries (sum/min/max) AND point updates on the same array — a plain prefix-sum array is O(1) query but O(n) update; a segment tree gives O(log n) for both. A Fenwick/BIT tree solves the narrower prefix-sum case with less code.',
  },
  {
    id: 'hashing',
    section: 'dsa',
    title: 'Hashing (Two Sum)',
    blurb: 'Trade a second loop for a hash map — check for a complement before inserting, one pass instead of two.',
    tag: 'O(n)',
    Component: HashingViz,
    code: [
      {
        lang: 'python',
        snippet: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return None`,
      },
      {
        lang: 'javascript',
        snippet: `function twoSum(nums, target) {
  const seen = {}
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (complement in seen) return [seen[complement], i]
    seen[nums[i]] = i
  }
  return null
}`,
      },
    ],
    leetcode: [
      { title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy', companies: ['Meta', 'Google', 'Amazon'] },
      { title: 'Group Anagrams', url: 'https://leetcode.com/problems/group-anagrams/', difficulty: 'Medium', companies: ['Meta'] },
      { title: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/', difficulty: 'Easy', companies: ['Google'] },
      { title: 'Subarray Sum Equals K', url: 'https://leetcode.com/problems/subarray-sum-equals-k/', difficulty: 'Medium', companies: ['Meta'] },
    ],
    realWorld:
      'The single most common opening question at every one of these companies, and for good reason — it\'s the simplest example of the "remember what you\'ve seen" trick that turns an O(n²) brute force into O(n) across dozens of other problems (grouping, deduplication, counting pairs).',
  },
  {
    id: 'intervals',
    section: 'dsa',
    title: 'Merge Intervals',
    blurb: 'Sort by start time, then sweep once — an interval can only ever overlap the most recently merged one.',
    tag: 'O(n log n)',
    Component: IntervalsViz,
    code: [
      {
        lang: 'python',
        snippet: `def merge_intervals(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = []
    for start, end in intervals:
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
      },
      {
        lang: 'javascript',
        snippet: `function mergeIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0])
  const merged = []
  for (const [start, end] of intervals) {
    if (merged.length && start <= merged[merged.length - 1][1]) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end)
    } else {
      merged.push([start, end])
    }
  }
  return merged
}`,
      },
    ],
    leetcode: [
      { title: 'Merge Intervals', url: 'https://leetcode.com/problems/merge-intervals/', difficulty: 'Medium', companies: ['Meta', 'Google', 'Amazon'] },
      { title: 'Insert Interval', url: 'https://leetcode.com/problems/insert-interval/', difficulty: 'Medium' },
      { title: 'Meeting Rooms II', url: 'https://leetcode.com/problems/meeting-rooms-ii/', difficulty: 'Medium', companies: ['Amazon'] },
      { title: 'Non-overlapping Intervals', url: 'https://leetcode.com/problems/non-overlapping-intervals/', difficulty: 'Medium' },
    ],
    realWorld:
      'Calendar/scheduling systems merging busy blocks, resource-booking conflict checks, and log-range compaction are all this exact sweep. Meeting Rooms II is the same idea run through a heap instead: track how many intervals are simultaneously "open."',
  },
  {
    id: 'prefix-sum',
    section: 'dsa',
    title: 'Prefix Sum',
    blurb: 'Precompute running totals so any range sum is a subtraction — O(1) per query after an O(n) setup.',
    tag: 'O(n)',
    Component: PrefixSumViz,
    code: [
      {
        lang: 'python',
        snippet: `def subarray_sum(nums, k):
    counts = {0: 1}
    total = 0
    result = 0
    for num in nums:
        total += num
        result += counts.get(total - k, 0)
        counts[total] = counts.get(total, 0) + 1
    return result`,
      },
      {
        lang: 'javascript',
        snippet: `function subarraySum(nums, k) {
  const counts = { 0: 1 }
  let total = 0
  let result = 0
  for (const num of nums) {
    total += num
    result += counts[total - k] || 0
    counts[total] = (counts[total] || 0) + 1
  }
  return result
}`,
      },
    ],
    leetcode: [
      { title: 'Subarray Sum Equals K', url: 'https://leetcode.com/problems/subarray-sum-equals-k/', difficulty: 'Medium', companies: ['Meta'] },
      { title: 'Product of Array Except Self', url: 'https://leetcode.com/problems/product-of-array-except-self/', difficulty: 'Medium', companies: ['Meta', 'Google'] },
      { title: 'Range Sum Query - Immutable', url: 'https://leetcode.com/problems/range-sum-query-immutable/', difficulty: 'Easy' },
      { title: 'Continuous Subarray Sum', url: 'https://leetcode.com/problems/continuous-subarray-sum/', difficulty: 'Medium', companies: ['Meta'] },
    ],
    realWorld:
      'Any "sum/count over a range, queried many times" problem wants this instead of re-summing each query. Combined with a hash map (like Subarray Sum Equals K) it also answers "how many subarrays satisfy X" without checking every subarray.',
  },
  {
    id: 'bit-manipulation',
    section: 'dsa',
    title: 'Bit Manipulation (XOR)',
    blurb: 'x XOR x = 0 and x XOR 0 = x — paired values cancel out of a running XOR regardless of order.',
    tag: 'O(n)',
    Component: BitManipulationViz,
    code: [
      {
        lang: 'python',
        snippet: `def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result`,
      },
      {
        lang: 'javascript',
        snippet: `function singleNumber(nums) {
  return nums.reduce((acc, n) => acc ^ n, 0)
}`,
      },
    ],
    leetcode: [
      { title: 'Single Number', url: 'https://leetcode.com/problems/single-number/', difficulty: 'Easy' },
      { title: 'Number of 1 Bits', url: 'https://leetcode.com/problems/number-of-1-bits/', difficulty: 'Easy' },
      { title: 'Counting Bits', url: 'https://leetcode.com/problems/counting-bits/', difficulty: 'Easy' },
      { title: 'Divide Two Integers', url: 'https://leetcode.com/problems/divide-two-integers/', difficulty: 'Medium', companies: ['Meta'] },
    ],
    realWorld:
      'Bitmasks compactly represent sets (used constantly in bitmask-DP for "subset of n items" problems), and XOR-based tricks show up in finding unique/missing elements without extra memory — a hash set would work too, but uses O(n) space this doesn\'t need.',
  },
  {
    id: 'lru-cache',
    section: 'dsa',
    title: 'LRU Cache (Design)',
    blurb: 'A hash map for O(1) lookup plus a doubly linked list for O(1) reordering and eviction — neither alone is enough.',
    tag: 'O(1) per op',
    Component: LruCacheViz,
    code: [
      {
        lang: 'python',
        snippet: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key):
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)`,
      },
      {
        lang: 'javascript',
        snippet: `// A JS Map preserves insertion order, which gives the same MRU/LRU
// reordering a hand-rolled doubly linked list would, with less code.
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }
  get(key) {
    if (!this.cache.has(key)) return -1
    const val = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, val)
    return val
  }
  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key)
    this.cache.set(key, value)
    if (this.cache.size > this.capacity) {
      this.cache.delete(this.cache.keys().next().value)
    }
  }
}`,
      },
    ],
    leetcode: [
      { title: 'LRU Cache', url: 'https://leetcode.com/problems/lru-cache/', difficulty: 'Medium', companies: ['OpenAI', 'Google'] },
      { title: 'LFU Cache', url: 'https://leetcode.com/problems/lfu-cache/', difficulty: 'Hard' },
      { title: 'Design Twitter', url: 'https://leetcode.com/problems/design-twitter/', difficulty: 'Medium' },
      { title: 'Insert Delete GetRandom O(1)', url: 'https://leetcode.com/problems/insert-delete-getrandom-o1/', difficulty: 'Medium' },
    ],
    realWorld:
      'By far the most-cited coding question in OpenAI onsite interviews, and a staple everywhere else too — it\'s less about a clever algorithm and more about composing two structures so their strengths cover each other\'s weaknesses, which is exactly the "practical, production-shaped" style these design questions look for.',
  },
  {
    id: 'binary-tree-dfs',
    section: 'dsa',
    title: 'Binary Tree DFS (Diameter)',
    blurb: "A node's height depends on both children's heights — post-order DFS computes it bottom-up.",
    tag: 'O(n)',
    Component: BinaryTreeDfsViz,
    code: [
      {
        lang: 'python',
        snippet: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def diameter_of_binary_tree(root):
    best = 0

    def height(node):
        nonlocal best
        if not node:
            return 0
        left = height(node.left)
        right = height(node.right)
        best = max(best, left + right)
        return max(left, right) + 1

    height(root)
    return best`,
      },
      {
        lang: 'javascript',
        snippet: `function diameterOfBinaryTree(root) {
  let best = 0
  function height(node) {
    if (!node) return 0
    const left = height(node.left)
    const right = height(node.right)
    best = Math.max(best, left + right)
    return Math.max(left, right) + 1
  }
  height(root)
  return best
}`,
      },
    ],
    leetcode: [
      { title: 'Diameter of Binary Tree', url: 'https://leetcode.com/problems/diameter-of-binary-tree/', difficulty: 'Easy', companies: ['Meta'] },
      { title: 'Binary Tree Maximum Path Sum', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', difficulty: 'Hard', companies: ['Meta'] },
      { title: 'Serialize and Deserialize Binary Tree', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', difficulty: 'Hard', companies: ['Google'] },
      { title: 'Lowest Common Ancestor of a Binary Tree', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', difficulty: 'Medium', companies: ['Meta'] },
      { title: 'Binary Tree Right Side View', url: 'https://leetcode.com/problems/binary-tree-right-side-view/', difficulty: 'Medium', companies: ['Amazon'] },
    ],
    realWorld:
      'Unlike the BST concept, none of these rely on left-smaller-right-bigger ordering — they\'re about the shape of an arbitrary binary tree. Diameter/max-path-sum both use the same "compute a value at each node from its children\'s already-computed values" post-order pattern that shows up in tree DP generally.',
  },
  {
    id: 'greedy-stock',
    section: 'dsa',
    title: 'Greedy: Buy/Sell Stock',
    blurb: 'Track the lowest price seen so far — the best possible profit today only depends on that one number.',
    tag: 'O(n)',
    Component: GreedyStockViz,
    code: [
      {
        lang: 'python',
        snippet: `def max_profit(prices):
    min_price = float('inf')
    best = 0
    for price in prices:
        min_price = min(min_price, price)
        best = max(best, price - min_price)
    return best`,
      },
      {
        lang: 'javascript',
        snippet: `function maxProfit(prices) {
  let minPrice = Infinity
  let best = 0
  for (const price of prices) {
    minPrice = Math.min(minPrice, price)
    best = Math.max(best, price - minPrice)
  }
  return best
}`,
      },
    ],
    leetcode: [
      { title: 'Best Time to Buy and Sell Stock', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', difficulty: 'Easy', companies: ['Meta'] },
      { title: 'Best Time to Buy and Sell Stock II', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/', difficulty: 'Medium' },
      { title: 'Jump Game', url: 'https://leetcode.com/problems/jump-game/', difficulty: 'Medium' },
      { title: 'Task Scheduler', url: 'https://leetcode.com/problems/task-scheduler/', difficulty: 'Medium', companies: ['Amazon'] },
    ],
    realWorld:
      'Greedy only works when a locally-best choice can be proven to never hurt the global optimum — here, a higher profit can never come from a higher previous minimum. When that proof doesn\'t hold (variable transaction costs, cooldowns, at-most-k-transactions), the problem becomes DP instead — Best Time II/III/IV are exactly that escalation.',
  },
  {
    id: 'two-heaps-median',
    section: 'dsa',
    title: 'Two Heaps: Median Finder',
    blurb: 'A max-heap for the lower half and a min-heap for the upper half, rebalanced after every insert.',
    tag: 'O(log n) insert',
    Component: TwoHeapsMedianViz,
    code: [
      {
        lang: 'python',
        snippet: `import heapq

class MedianFinder:
    def __init__(self):
        self.lower = []  # max-heap, values negated
        self.upper = []  # min-heap

    def add_num(self, num):
        heapq.heappush(self.lower, -num)
        heapq.heappush(self.upper, -heapq.heappop(self.lower))
        if len(self.upper) > len(self.lower):
            heapq.heappush(self.lower, -heapq.heappop(self.upper))

    def find_median(self):
        if len(self.lower) > len(self.upper):
            return -self.lower[0]
        return (-self.lower[0] + self.upper[0]) / 2`,
      },
      {
        lang: 'javascript',
        snippet: `// Shown with sorted-array halves for clarity — swap in the MinHeap from
// the Heap concept (and its max-heap mirror) for real O(log n) inserts.
class MedianFinder {
  constructor() {
    this.lower = [] // sorted desc
    this.upper = [] // sorted asc
  }
  addNum(num) {
    if (!this.lower.length || num <= this.lower[0]) {
      this.lower.push(num)
      this.lower.sort((a, b) => b - a)
    } else {
      this.upper.push(num)
      this.upper.sort((a, b) => a - b)
    }
    if (this.lower.length > this.upper.length + 1) {
      this.upper.unshift(this.lower.shift())
    } else if (this.upper.length > this.lower.length) {
      this.lower.push(this.upper.shift())
      this.lower.sort((a, b) => b - a)
    }
  }
  findMedian() {
    if (this.lower.length > this.upper.length) return this.lower[0]
    return (this.lower[0] + this.upper[0]) / 2
  }
}`,
      },
    ],
    leetcode: [
      { title: 'Find Median from Data Stream', url: 'https://leetcode.com/problems/find-median-from-data-stream/', difficulty: 'Hard', companies: ['Google', 'Amazon'] },
      { title: 'Sliding Window Median', url: 'https://leetcode.com/problems/sliding-window-median/', difficulty: 'Hard' },
      { title: 'IPO', url: 'https://leetcode.com/problems/ipo/', difficulty: 'Hard' },
    ],
    realWorld:
      'Anywhere a running statistic (median, percentile) needs updating as data streams in without re-sorting everything each time — monitoring dashboards computing p50 latency live are doing a variant of exactly this.',
  },
]
