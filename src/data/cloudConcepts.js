import { createElement } from 'react'
import StateDemo from '../concepts/shared/StateDemo.jsx'

// Registry for the /cloud section — 28 cloud computing topics, grouped
// Compute / Storage / Networking / IAM & Security / Reliability & Deployment
// / Cost & Observability. Reuses the same before/after StateDemo the Git
// Commands, API Design, Databases, and AI Integration sections use.
const demo = (props) => () => createElement(StateDemo, props)

export const cloudConcepts = [
  {
    id: 'virtual-machines',
    section: 'cloud',
    title: 'Virtual Machines',
    blurb: 'A full emulated computer — its own OS, kernel, and resources — running on shared physical hardware via a hypervisor.',
    tag: 'Compute',
    Component: demo({
      command: 'provision a VM',
      before: [{ label: 'bare metal server', sub: '1 OS, fully dedicated, slow to provision', color: 'var(--accent)' }],
      after: [{ label: 'VM on shared host', sub: 'own OS, provisioned in minutes', color: 'var(--good)' }],
      note: {
        before: 'A physical server can only run one OS at a time, and buying/racking new hardware takes days or weeks.',
        after: 'A hypervisor slices one physical machine into several isolated virtual ones — a new VM is ready in minutes, not weeks.',
      },
    }),
    code: [{ lang: 'bash', snippet: `aws ec2 run-instances \\\n  --image-id ami-0abcdef1234567890 \\\n  --instance-type t3.medium \\\n  --key-name my-key` }],
    realWorld:
      'EC2, Google Compute Engine, and Azure VMs are literally this — a full OS you fully control, billed by the hour or second, without owning or racking any hardware.',
    pitfall:
      "A VM boots its entire OS (seconds to a minute or more) and reserves fixed resources whether it's busy or idle — much heavier and slower to start than a container for the same workload.",
    fix:
      "Use containers when the workload is a single application process that doesn't need a full separate OS — reserve full VMs for workloads that genuinely need OS-level isolation or a specific kernel.",
  },
  {
    id: 'containers',
    section: 'cloud',
    title: 'Containers',
    blurb: 'A lightweight, isolated process that packages an application with its dependencies — sharing the host OS kernel instead of running its own.',
    tag: 'Compute',
    Component: demo({
      command: 'containerize the app',
      before: [{ label: '"works on my machine"', sub: 'different OS libs on prod', color: 'var(--bad)' }],
      after: [{ label: 'docker run myapp:v1', sub: 'identical environment everywhere', color: 'var(--good)' }],
      note: {
        before: 'The app works locally but breaks in production because the two environments have subtly different library versions or OS configuration.',
        after: 'The container bundles the exact runtime, libraries, and code together — it behaves identically on a laptop, in CI, and in production.',
      },
    }),
    code: [{ lang: 'dockerfile', snippet: `FROM node:20-slim\nCOPY . /app\nRUN npm install\nCMD ["node", "server.js"]\n\n# docker build -t myapp:v1 .\n# docker run myapp:v1` }],
    realWorld:
      'Docker made this the default unit of deployment for most modern web services — one image, built once, runs identically on any machine with a container runtime.',
    pitfall:
      "Containers share the host's kernel, a weaker isolation boundary than a VM — a container escape vulnerability can potentially affect the host or other containers on it.",
    fix:
      'Run containers with least-privilege settings (no --privileged, drop unnecessary Linux capabilities), and use VM-level isolation (or microVMs) for genuinely untrusted, multi-tenant workloads.',
  },
  {
    id: 'container-orchestration',
    section: 'cloud',
    title: 'Container Orchestration (Kubernetes)',
    blurb: 'Automates deploying, scaling, healing, and networking many containers across a cluster of machines, instead of managing each container by hand.',
    tag: 'Compute',
    Component: demo({
      command: 'let the orchestrator handle it',
      before: [{ label: 'container crashes', sub: 'stays down until someone notices', color: 'var(--bad)' }],
      after: [{ label: 'container crashes → orchestrator restarts it automatically', color: 'var(--good)' }],
      note: {
        before: 'Running containers manually on individual machines means a crash just stays crashed, until a human checks and restarts it.',
        after: 'The orchestrator continuously watches actual state against desired state — a crashed container gets rescheduled automatically.',
      },
    }),
    code: [{ lang: 'yaml', snippet: `apiVersion: apps/v1\nkind: Deployment\nmetadata: { name: web }\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n      - name: web\n        image: myapp:v1` }],
    realWorld:
      'Kubernetes runs most large-scale containerized deployments — declare "I want 3 replicas always running" and it continuously reconciles reality to match, rescheduling on node failure automatically.',
    pitfall:
      "Kubernetes' own operational complexity (YAML sprawl, networking layers, RBAC) is real overhead — running a full cluster to host two simple containers is often more burden than the containers themselves.",
    fix:
      "Use a managed container platform for small workloads, and reserve a self-managed cluster for scale that genuinely needs Kubernetes' flexibility.",
  },
  {
    id: 'serverless',
    section: 'cloud',
    title: 'Serverless / FaaS',
    blurb: 'Code runs in response to an event, in a provider-managed runtime that scales automatically — you never provision or manage a server at all.',
    tag: 'Compute',
    Component: demo({
      command: 'deploy as a function',
      before: [{ label: 'server running 24/7', sub: 'billed even while idle, waiting for requests', color: 'var(--bad)' }],
      after: [{ label: 'function invoked on-demand', sub: 'billed only for actual execution time', color: 'var(--good)' }],
      note: {
        before: 'A traditional server sits running (and being billed for) around the clock, whether or not any requests are actually arriving.',
        after: 'The function only exists for the duration of each invocation — billing tracks only the milliseconds actually used.',
      },
    }),
    code: [{ lang: 'js', snippet: `// handler.js\nexports.handler = async (event) => {\n  return { statusCode: 200, body: \`Hello, \${event.name}\` };\n};\n// deployed as a Lambda function, triggered by API Gateway/events` }],
    realWorld:
      'Image thumbnail generation on upload, webhook processing, and bursty/unpredictable-traffic APIs are classic serverless cases — cost and scaling both track actual usage automatically.',
    pitfall:
      '"Cold starts" — the delay while the provider spins up a fresh execution environment for a function that hasn\'t run recently — can add hundreds of milliseconds to the first request after idle time.',
    fix:
      "Use provisioned concurrency (a warm pool of instances) for latency-sensitive functions, or accept cold starts for background/async work where extra milliseconds don't matter.",
  },
  {
    id: 'auto-scaling',
    section: 'cloud',
    title: 'Auto Scaling',
    blurb: 'Automatically adding or removing compute capacity based on real-time demand, instead of provisioning for a fixed guess at peak load.',
    tag: 'Compute',
    Component: demo({
      command: 'scale with demand',
      before: [{ label: 'fixed 10 servers', sub: 'overpaying at 2am, overloaded at noon', color: 'var(--bad)' }],
      after: [{ label: '2 servers at 2am → 10 servers at noon', sub: 'capacity tracks actual traffic', color: 'var(--good)' }],
      note: {
        before: 'A fixed server count is a guess — it wastes money during low-traffic hours and risks falling over during genuine spikes.',
        after: "Capacity grows and shrinks automatically based on real load — paying roughly for what's actually being used, at any hour.",
      },
    }),
    code: [{ lang: 'yaml', snippet: `autoScaling:\n  minInstances: 2\n  maxInstances: 20\n  targetCPUUtilization: 70%\n  # scale out above 70% average CPU, scale in below it` }],
    realWorld:
      "Nearly every cloud provider's auto-scaling group (or Kubernetes Horizontal Pod Autoscaler) does exactly this — e-commerce sites scale up for a flash sale and back down overnight automatically.",
    pitfall:
      'Scaling reactively on a metric like CPU has a lag — by the time new capacity is up and healthy, the traffic spike that triggered scaling may already be overwhelming existing instances.',
    fix:
      'Scale on a leading indicator (queue depth, request latency) rather than a lagging one where possible, and pre-warm capacity ahead of known, predictable spikes instead of relying purely on reactive scaling.',
  },
  {
    id: 'object-storage',
    section: 'cloud',
    title: 'Object Storage',
    blurb: 'Stores files as flat, independently-addressable objects (each with an id/key) accessed over HTTP — not a filesystem, not a database, but infinitely scalable.',
    tag: 'Storage',
    Component: demo({
      command: 'store the object',
      before: [{ label: "files on a server's local disk", sub: "capped by that one disk's size", color: 'var(--accent)' }],
      after: [{ label: 'PUT s3://bucket/photo.jpg', sub: 'effectively unlimited, served over HTTP', color: 'var(--good)' }],
      note: {
        before: "Files on local disk are limited by that server's actual disk capacity, and only that server can serve them directly.",
        after: 'The object lives in a service built to scale to exabytes — any server (or browser) can fetch it directly over HTTP.',
      },
    }),
    code: [{ lang: 'bash', snippet: `aws s3 cp photo.jpg s3://my-bucket/photo.jpg\ncurl https://my-bucket.s3.amazonaws.com/photo.jpg` }],
    realWorld:
      'S3, Google Cloud Storage, and Azure Blob Storage back nearly every image, video, and static file served by a modern web application — decoupled entirely from any one application server.',
    pitfall:
      'Object storage has no native "modify part of a file" operation — updating even one byte of a large object means re-uploading the entire object, unlike a filesystem\'s in-place writes.',
    fix:
      'Use object storage for whole, immutable files (images, backups, logs) — reach for block or file storage for workloads that genuinely need partial, in-place modification.',
  },
  {
    id: 'block-storage',
    section: 'cloud',
    title: 'Block Storage',
    blurb: 'Raw, low-level storage volumes (like a virtual hard disk) attached directly to one VM — the same model as a physical disk, formatted with a filesystem.',
    tag: 'Storage',
    Component: demo({
      command: 'attach a volume',
      before: [{ label: 'VM with no persistent disk', sub: 'data vanishes when the instance stops', color: 'var(--bad)' }],
      after: [{ label: 'VM + attached 100GB volume', sub: "persists independently of the VM's lifecycle", color: 'var(--good)' }],
      note: {
        before: "An instance's default local disk is often ephemeral — stop or terminate the VM, and anything written there can be gone.",
        after: 'A separately-attached volume persists on its own — detach it from one VM and reattach it to another, data intact.',
      },
    }),
    code: [{ lang: 'bash', snippet: `aws ec2 create-volume --size 100 --availability-zone us-east-1a\naws ec2 attach-volume --volume-id vol-0abc123 --instance-id i-0def456 --device /dev/sdf` }],
    realWorld:
      "A database server's data directory is the classic block storage case — it needs low-latency, filesystem-level random reads and writes only a directly-attached volume provides.",
    pitfall:
      "A block storage volume is bound to a single availability zone and can only attach to one instance at a time — it doesn't survive a zone outage and can't be shared across servers.",
    fix:
      'Snapshot volumes regularly for durability across a zone failure, and use file storage instead of block storage for anything that genuinely needs to be shared, read/write, across multiple servers.',
  },
  {
    id: 'file-storage',
    section: 'cloud',
    title: 'File Storage',
    blurb: 'A shared, hierarchical filesystem (directories and files) that multiple servers can mount and read/write concurrently over the network.',
    tag: 'Storage',
    Component: demo({
      command: 'mount as a shared filesystem',
      before: [{ label: "each server has its own local /uploads folder", sub: 'not visible to other servers', color: 'var(--bad)' }],
      after: [{ label: 'all servers mount the same NFS share', sub: 'every server sees every file', color: 'var(--good)' }],
      note: {
        before: "A file saved on one server's local disk isn't visible to any other server — a user hitting a different server would find their file missing.",
        after: 'Every server mounts the same shared filesystem — a file written by any one of them is immediately visible to all the others.',
      },
    }),
    code: [{ lang: 'bash', snippet: `sudo mount -t nfs fs-0abc123.efs.us-east-1.amazonaws.com:/ /mnt/shared\nls /mnt/shared  # same files, visible from every mounted server` }],
    realWorld:
      'Amazon EFS and Google Filestore back shared content directories, home directories on compute clusters, and any legacy app expecting a real POSIX filesystem shared across multiple machines.',
    pitfall:
      'Network filesystem latency is meaningfully higher than local disk — an application doing many small, latency-sensitive file operations can be noticeably slower against shared file storage.',
    fix:
      'Use file storage specifically when multiple servers genuinely need concurrent read/write access to the same files — for single-server or read-heavy workloads, local disk or object storage is usually faster.',
  },
  {
    id: 'storage-lifecycle',
    section: 'cloud',
    title: 'Storage Tiers & Lifecycle Policies',
    blurb: 'Automatically moving data to cheaper, slower storage classes as it ages — most data is accessed constantly at first, then almost never.',
    tag: 'Storage',
    Component: demo({
      command: 'apply a lifecycle policy',
      before: [{ label: '5-year-old log file', sub: 'still on premium, frequent-access storage', color: 'var(--bad)' }],
      after: [{ label: 'auto-moved to archive tier after 90 days', sub: '~80% cheaper, retrieval takes longer', color: 'var(--good)' }],
      note: {
        before: "Data that hasn't been touched in years is still paying the same per-GB rate as data accessed every second.",
        after: 'A lifecycle rule automatically demotes aging data to a much cheaper tier — the same data, at a fraction of the cost.',
      },
    }),
    code: [{ lang: 'yaml', snippet: `lifecycleRule:\n  - transition: { days: 30, storageClass: INFREQUENT_ACCESS }\n  - transition: { days: 90, storageClass: GLACIER }\n  - expiration: { days: 2555 }  # delete after 7 years` }],
    realWorld:
      'S3 Glacier, GCS Coldline/Archive, and similar tiers exist specifically for compliance-retained logs, old backups, and infrequently-accessed media — the same durability, a fraction of the ongoing cost.',
    pitfall:
      'Archive-tier storage often has real retrieval latency (minutes to hours) and per-retrieval fees — moving data there that turns out to still be needed regularly can cost more overall than leaving it on standard storage.',
    fix:
      "Base lifecycle transitions on actual access patterns rather than a blanket age-based guess, and keep genuinely-still-needed data on a faster tier regardless of age.",
  },
  {
    id: 'vpc',
    section: 'cloud',
    title: 'Virtual Private Cloud (VPC)',
    blurb: "An isolated, private network carved out of a cloud provider's shared infrastructure — your own address space, invisible to every other customer by default.",
    tag: 'Networking',
    Component: demo({
      command: 'create an isolated network',
      before: [{ label: 'shared public cloud network', sub: 'no network-level isolation from other tenants', color: 'var(--accent)' }],
      after: [{ label: 'VPC: 10.0.0.0/16, fully isolated', sub: 'your own private address space', color: 'var(--good)' }],
      note: {
        before: "Without network isolation, every tenant's traffic would share the same address space with no boundary between them.",
        after: "A VPC is a logically isolated slice of the cloud — its own IP range and routing, invisible to any other customer's VPC by default.",
      },
    }),
    code: [{ lang: 'bash', snippet: `aws ec2 create-vpc --cidr-block 10.0.0.0/16\naws ec2 create-subnet --vpc-id vpc-0abc123 --cidr-block 10.0.1.0/24` }],
    realWorld:
      "Every serious cloud deployment starts with a VPC — it's the network boundary everything else (subnets, security groups, load balancers) is defined inside of.",
    pitfall:
      "Two VPCs with overlapping IP address ranges can't be directly peered or connected without complex NAT workarounds — a range picked without planning for future connections can cause real pain later.",
    fix:
      "Plan non-overlapping CIDR ranges across all VPCs (including ones you might connect to later) before creating any of them.",
  },
  {
    id: 'subnets',
    section: 'cloud',
    title: 'Public vs Private Subnets',
    blurb: 'Splitting a VPC into a public subnet (internet-reachable) and private subnets (internal-only) — most resources belong in private.',
    tag: 'Networking',
    Component: demo({
      command: 'move the database to private',
      before: [{ label: 'database in public subnet', sub: 'has a public IP, internet-reachable', color: 'var(--bad)' }],
      after: [{ label: 'database in private subnet', sub: 'no public IP, reachable only from inside the VPC', color: 'var(--good)' }],
      note: {
        before: 'A database with a public IP address is directly reachable from the internet — every port scan and brute-force attempt on the planet can reach it.',
        after: 'With no public IP and no route to the internet gateway, the database is reachable only from other resources inside the VPC.',
      },
    }),
    code: [{ lang: 'bash', snippet: `# Public subnet: has a route to the internet gateway\naws ec2 create-route --route-table-id rtb-public --destination-cidr-block 0.0.0.0/0 --gateway-id igw-0abc\n\n# Private subnet: no such route — internal traffic only` }],
    realWorld:
      'Standard cloud architecture: load balancers and bastion hosts sit in a public subnet; application servers and databases sit in private subnets, reachable only through the load balancer or a VPN.',
    pitfall:
      'Accidentally assigning a public IP (or an overly permissive route table) to a resource meant to be private is one of the most common real-world cloud misconfigurations.',
    fix:
      'Default every resource to a private subnet unless it specifically needs to be internet-facing, and audit route tables and public IP assignments as a standing security check.',
  },
  {
    id: 'security-groups',
    section: 'cloud',
    title: 'Security Groups vs NACLs',
    blurb: 'Security groups are stateful, instance-level firewalls (allow rules only); network ACLs are stateless, subnet-level firewalls (allow and deny rules).',
    tag: 'Networking',
    Component: demo({
      command: 'add a firewall rule',
      before: [{ label: 'no inbound rule for port 443', sub: 'HTTPS traffic blocked by default', color: 'var(--bad)' }],
      after: [{ label: 'security group: allow 443 from 0.0.0.0/0', sub: 'HTTPS now reachable', color: 'var(--good)' }],
      note: {
        before: 'Security groups deny everything by default — with no explicit allow rule, even legitimate traffic on that port is blocked.',
        after: 'One explicit allow rule opens exactly the intended traffic — everything else stays denied by default.',
      },
    }),
    code: [{ lang: 'bash', snippet: `aws ec2 authorize-security-group-ingress \\\n  --group-id sg-0abc123 \\\n  --protocol tcp --port 443 --cidr 0.0.0.0/0` }],
    realWorld:
      'Security groups are the day-to-day firewall tool for most cloud workloads — stateful means a response to an allowed outbound request is automatically allowed back in.',
    pitfall:
      "Confusing security groups (stateful, allow-only) with NACLs (stateless, allow AND deny) leads to rules that don't behave as expected — a NACL rule needs a matching rule in *both* directions.",
    fix:
      'Use security groups as the primary, day-to-day access control; reserve NACLs for coarse subnet-level deny rules where their statelessness is actually needed.',
  },
  {
    id: 'nat-gateway',
    section: 'cloud',
    title: 'NAT Gateway',
    blurb: 'Lets resources in a private subnet (no public IP) initiate outbound internet connections, without exposing them to inbound connections from the internet.',
    tag: 'Networking',
    Component: demo({
      command: 'route outbound through NAT',
      before: [{ label: 'private subnet server needs to pip install', sub: 'no route to the internet at all', color: 'var(--bad)' }],
      after: [{ label: 'private subnet → NAT Gateway → internet', sub: 'outbound works, still unreachable inbound', color: 'var(--good)' }],
      note: {
        before: "A server with no public IP and no route to the internet gateway simply can't reach anything outside the VPC.",
        after: 'Traffic routes out through the NAT Gateway and the response comes back — but nothing outside can initiate a connection in.',
      },
    }),
    code: [{ lang: 'bash', snippet: `aws ec2 create-nat-gateway --subnet-id subnet-public --allocation-id eipalloc-0abc123\naws ec2 create-route --route-table-id rtb-private --destination-cidr-block 0.0.0.0/0 --nat-gateway-id nat-0def456` }],
    realWorld:
      'Private application servers that need to call external APIs or download OS updates, while staying completely unreachable from the internet inbound, rely on exactly this pattern.',
    pitfall:
      'NAT Gateways bill per-hour and per-GB processed — a chatty private service pushing a lot of traffic through one can rack up a surprisingly large bill for what looks like "just routing".',
    fix:
      'Use VPC endpoints (direct private connections to specific cloud services like S3) instead of routing through a NAT Gateway when the destination is a supported same-cloud service.',
  },
  {
    id: 'iam-roles',
    section: 'cloud',
    title: 'IAM Roles & Policies',
    blurb: 'A role is an identity with a defined set of permissions (a policy) that can be assumed by a user, service, or resource — never a hardcoded credential.',
    tag: 'IAM & Security',
    Component: demo({
      command: 'assume a role',
      before: [{ label: 'access key hardcoded in code', sub: 'long-lived, leaks if code leaks', color: 'var(--bad)' }],
      after: [{ label: 'EC2 instance assumes IAM role', sub: 'temporary credentials, auto-rotated', color: 'var(--good)' }],
      note: {
        before: "A hardcoded access key lives forever until manually rotated — if it leaks, it's valid until someone notices and revokes it.",
        after: 'The instance assumes a role and receives short-lived, automatically-rotating credentials — nothing long-lived to leak.',
      },
    }),
    code: [{ lang: 'json', snippet: `{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Action": "s3:GetObject",\n    "Resource": "arn:aws:s3:::my-bucket/*"\n  }]\n}` }],
    realWorld:
      'Every well-run cloud environment attaches IAM roles to compute resources instead of embedding static access keys — the default recommended pattern across every major cloud.',
    pitfall:
      'A role with an overly broad policy (Action: "*", Resource: "*") grants far more access than the resource needs — if it\'s ever compromised, the blast radius is the entire account.',
    fix:
      "Scope every role's policy to exactly the specific actions and resources it needs, and audit for wildcard permissions as a standing security review.",
  },
  {
    id: 'least-privilege',
    section: 'cloud',
    title: 'Principle of Least Privilege',
    blurb: 'Every identity gets exactly the access it needs to do its job — nothing more — so a compromised credential does the least possible damage.',
    tag: 'IAM & Security',
    Component: demo({
      command: 'scope down the permissions',
      before: [{ label: '"AdministratorAccess" on a CI pipeline', sub: 'full account access for a job that deploys to one bucket', color: 'var(--bad)' }],
      after: [{ label: 'scoped to: s3:PutObject on one specific bucket', color: 'var(--good)' }],
      note: {
        before: 'A CI pipeline with full admin access can do literally anything in the account if its credentials are ever exposed.',
        after: 'The exact same task still works, but a leaked credential can now only do that one narrow thing.',
      },
    }),
    code: [{ lang: 'json', snippet: `{\n  "Effect": "Allow",\n  "Action": "s3:PutObject",\n  "Resource": "arn:aws:s3:::deploy-bucket/*"\n}` }],
    realWorld:
      'Every credible security framework leads with this principle — the single most effective mitigation against the "one leaked credential" class of incident, since it caps what that credential can do.',
    pitfall:
      '"Just grant admin, we\'ll scope it down later" is a permanent trap — scoping down after the fact means reverse-engineering exactly what permissions were actually used, which nobody ever prioritizes.',
    fix:
      'Start with a minimal policy and add specific permissions as concrete needs arise, rather than starting broad and hoping to narrow later.',
  },
  {
    id: 'secrets-management',
    section: 'cloud',
    title: 'Secrets Management',
    blurb: 'Storing API keys, passwords, and certificates in a dedicated, access-controlled, auditable service — never in code, config files, or committed environment variables.',
    tag: 'IAM & Security',
    Component: demo({
      command: 'move the secret out of the repo',
      before: [{ label: 'DATABASE_PASSWORD in .env, committed to git', sub: 'visible in history forever, even after deletion', color: 'var(--bad)' }],
      after: [{ label: 'app fetches secret from Secrets Manager at runtime', sub: 'never touches disk or version control', color: 'var(--good)' }],
      note: {
        before: 'A secret committed to git history stays there forever, even if the file is later deleted.',
        after: "The application fetches the current secret value at runtime from a dedicated service — it's never written to a file or committed.",
      },
    }),
    code: [{ lang: 'python', snippet: `secret = secrets_manager.get_secret_value(SecretId="prod/db-password")\ndb.connect(password=secret["SecretString"])` }],
    realWorld:
      'AWS Secrets Manager, HashiCorp Vault, and GCP Secret Manager centralize storage with access control, audit logs, and automatic rotation, instead of secrets scattered across config files.',
    pitfall:
      'A secrets manager only helps if used consistently — one forgotten hardcoded credential in an old script undermines the whole system, since an attacker only needs to find the one place it was missed.',
    fix:
      'Run automated secret-scanning on every commit to catch hardcoded credentials before they\'re ever pushed, rather than relying on discipline alone.',
  },
  {
    id: 'encryption',
    section: 'cloud',
    title: 'Encryption at Rest & in Transit',
    blurb: 'Data is encrypted both while stored on disk (at rest) and while moving across the network (in transit) — two separate protections against two separate threats.',
    tag: 'IAM & Security',
    Component: demo({
      command: 'enable both',
      before: [{ label: 'unencrypted disk + plain HTTP', sub: 'readable if the disk is stolen or traffic is intercepted', color: 'var(--bad)' }],
      after: [{ label: 'encrypted volume + TLS', sub: 'unreadable without the keys, either way', color: 'var(--good)' }],
      note: {
        before: 'An unencrypted disk is fully readable by anyone with physical access; plaintext HTTP traffic is fully readable by anyone who intercepts it.',
        after: 'Data on disk is unreadable without the key even if stolen; data on the wire is unreadable even if intercepted mid-transit.',
      },
    }),
    code: [{ lang: 'yaml', snippet: `storage:\n  encrypted: true\n  kmsKeyId: arn:aws:kms:us-east-1:123456789012:key/abc-123\n\nserver:\n  tls: { enabled: true, minVersion: "TLSv1.2" }` }],
    realWorld:
      'Compliance frameworks (PCI-DSS, HIPAA, SOC 2) all require both — encryption at rest protects against a stolen disk, encryption in transit protects against network interception.',
    pitfall:
      '"Encrypted" storage with a poorly-protected or overly-shared key isn\'t meaningfully protected — anyone who can get the key can decrypt the data just as easily as if it were never encrypted.',
    fix:
      "Manage encryption keys through a dedicated key management service (KMS) with its own tight access control and rotation policy — the key's protection matters as much as the encryption itself.",
  },
  {
    id: 'availability-zones',
    section: 'cloud',
    title: 'Availability Zones vs Regions',
    blurb: 'A region is a geographic area; availability zones are physically separate data centers within it — spreading across AZs survives a single data center failure.',
    tag: 'Reliability & Deployment',
    Component: demo({
      command: 'spread across AZs',
      before: [{ label: 'all instances in us-east-1a', sub: 'one data center outage takes everything down', color: 'var(--bad)' }],
      after: [{ label: 'instances split across 1a, 1b, 1c', sub: 'survives any single AZ failure', color: 'var(--good)' }],
      note: {
        before: 'Every instance sits in the same physical data center — a power outage or network failure there takes the entire service down at once.',
        after: 'The same total capacity is spread across three physically independent data centers — losing any one leaves two-thirds running.',
      },
    }),
    code: [{ lang: 'bash', snippet: `aws ec2 run-instances --count 6 \\\n  --placement AvailabilityZone=us-east-1a  # then 1b, then 1c — split evenly` }],
    realWorld:
      'Every production architecture guide from every major cloud provider leads with "deploy across at least 2-3 AZs" — the cheapest, most standard protection against a single data center failure.',
    pitfall:
      'Spreading compute across AZs but leaving the database as a single instance in one AZ means the "highly available" architecture still has one single point of failure at the data layer.',
    fix:
      'Match the availability strategy across every layer — a multi-AZ database (with automatic failover to a standby) alongside multi-AZ compute, not just one or the other.',
  },
  {
    id: 'multi-region',
    section: 'cloud',
    title: 'Multi-Region Architecture',
    blurb: 'Running a full, independent copy of the application in a second geographic region — survives an entire region going down, not just one data center.',
    tag: 'Reliability & Deployment',
    Component: demo({
      command: 'add a second region',
      before: [{ label: 'entire app in us-east-1', sub: 'a region-wide outage takes everything down', color: 'var(--bad)' }],
      after: [{ label: 'us-east-1 + eu-west-1, both active', sub: 'traffic reroutes if one region fails', color: 'var(--good)' }],
      note: {
        before: 'Multi-AZ protects against a single data center failing — but an entire cloud region going down still takes the whole service with it.',
        after: 'A second, independent region can absorb traffic if the first goes down entirely — DNS or a global load balancer routes around the failure.',
      },
    }),
    code: [{ lang: 'yaml', snippet: `regions:\n  - name: us-east-1\n    status: active\n  - name: eu-west-1\n    status: active\n# global DNS/load balancer routes to the nearest healthy region` }],
    realWorld:
      'Global platforms run multi-region specifically because a region-wide cloud outage — which has happened to every major provider at least once — would otherwise mean total downtime.',
    pitfall:
      'Multi-region roughly doubles infrastructure cost and adds real complexity (data replication, consistency across regions, deployment coordination) — a significant investment most apps don\'t need.',
    fix:
      'Reserve multi-region for services where region-wide downtime is genuinely unacceptable — multi-AZ within one region is sufficient reliability for most applications.',
  },
  {
    id: 'disaster-recovery',
    section: 'cloud',
    title: 'Disaster Recovery (RTO/RPO)',
    blurb: 'A documented, tested plan for recovering from a major failure — defined by how much data loss is acceptable (RPO) and how long recovery can take (RTO).',
    tag: 'Reliability & Deployment',
    Component: demo({
      command: 'define the targets',
      before: [{ label: '"we have backups"', sub: 'never tested, unknown recovery time', color: 'var(--bad)' }],
      after: [{ label: 'RPO: 1 hour, RTO: 4 hours', sub: 'tested quarterly', color: 'var(--good)' }],
      note: {
        before: '"We have backups" says nothing about how much data would actually be lost or how long restoring would actually take.',
        after: 'Concrete, tested numbers mean everyone knows what to expect — a quarterly test confirms the plan still actually works.',
      },
    }),
    code: [{ lang: 'yaml', snippet: `disasterRecovery:\n  rpo: 1h    # max acceptable data loss\n  rto: 4h    # max acceptable time to restore service\n  testSchedule: quarterly` }],
    realWorld:
      'Financial and healthcare systems typically have strict, regulator-mandated RTO/RPO targets — any business that would suffer real harm from downtime or data loss needs this defined, not assumed.',
    pitfall:
      'A disaster recovery plan that\'s never been executed (only written down) routinely turns out to be wrong in practice — a missing permission, a stale runbook, none of which show up until the real disaster.',
    fix:
      'Actually run the recovery process on a schedule (a "game day" restoring from backup, failing over to the DR region) — the rehearsal is what makes the RTO/RPO numbers trustworthy.',
  },
  {
    id: 'blue-green-deployment',
    section: 'cloud',
    title: 'Blue-Green Deployment',
    blurb: 'Running two identical production environments — only one live at a time — and switching all traffic to the new one instantly, with instant rollback if needed.',
    tag: 'Reliability & Deployment',
    Component: demo({
      command: 'switch traffic to green',
      before: [{ label: 'blue (v1) live', sub: 'green (v2) fully deployed, idle, ready', color: 'var(--accent)' }],
      after: [{ label: 'green (v2) live', sub: 'traffic switched instantly; blue kept as instant rollback', color: 'var(--good)' }],
      note: {
        before: 'The new version is fully deployed and tested in isolation, but zero live traffic has hit it yet.',
        after: "All traffic now flows to the new version — and the old one stays running, ready to take traffic back instantly if something's wrong.",
      },
    }),
    code: [{ lang: 'yaml', snippet: `loadBalancer:\n  target: green   # was: blue\n  # switching this one value routes 100% of traffic instantly\n  # blue stays running, unmodified, as an instant rollback target` }],
    realWorld:
      'High-stakes deployments (payment processing, anything where even a brief bad rollout is costly) use blue-green for the instant, zero-downtime rollback it provides.',
    pitfall:
      'Running two full production environments simultaneously doubles infrastructure cost for the deployment — and any database schema change has to stay compatible with both versions during the switch.',
    fix:
      "Keep database migrations backward-compatible across the blue-green boundary, and only keep both environments running as long as needed to confirm the switch.",
  },
  {
    id: 'canary-deployment',
    section: 'cloud',
    title: 'Canary Deployment',
    blurb: 'Rolling out a new version to a small slice of real traffic first, watching for problems, then gradually expanding — instead of switching everyone at once.',
    tag: 'Reliability & Deployment',
    Component: demo({
      command: 'ramp up gradually',
      before: [{ label: 'v2 deployed to 100% of traffic at once', sub: 'a bug affects every user immediately', color: 'var(--bad)' }],
      after: [{ label: 'v2 → 5% → 25% → 100%', sub: 'watching error rates at each step', color: 'var(--good)' }],
      note: {
        before: 'A big-bang deployment means any bug in the new version is immediately affecting all traffic, with no early warning.',
        after: "A small slice of traffic hits the new version first — a spike in errors there is caught and rolled back before it reaches most users.",
      },
    }),
    code: [{ lang: 'yaml', snippet: `canary:\n  steps:\n    - { weight: 5, pauseFor: 10m }\n    - { weight: 25, pauseFor: 10m }\n    - { weight: 100 }\n  rollbackOn: { errorRate: "> 1%" }` }],
    realWorld:
      'Large-scale services deploy almost everything as a canary — a bad rollout gets caught and auto-rolled-back at 5% of traffic instead of 100%.',
    pitfall:
      '"Canary" without real, automated monitoring on the canary slice is just a slower, more complicated big-bang deploy with extra steps.',
    fix:
      'Wire the canary stage to an automated rollback trigger on a concrete metric (error rate, latency) — a canary a human has to remember to watch manually defeats the purpose.',
  },
  {
    id: 'immutable-infrastructure',
    section: 'cloud',
    title: 'Immutable Infrastructure',
    blurb: 'Servers are never patched or modified in place — a change means building and deploying an entirely new server image and replacing the old one.',
    tag: 'Reliability & Deployment',
    Component: demo({
      command: "replace, don't patch",
      before: [{ label: 'ssh in, apt-get update, restart service', sub: 'server config now differs from every other one', color: 'var(--bad)' }],
      after: [{ label: 'build new image → deploy → terminate old', sub: 'every server is identical, always', color: 'var(--good)' }],
      note: {
        before: 'A manual in-place fix on one server means that server now silently differs from the rest of the fleet.',
        after: "A fresh image is built from a known-good definition and every server is replaced from it — no hand-patched snowflake.",
      },
    }),
    code: [{ lang: 'bash', snippet: `packer build server-image.json    # builds a new, versioned image\nterraform apply                   # replaces old instances with new-image instances\n# nobody ever SSHes in to patch a running server` }],
    realWorld:
      "Auto-scaling groups built from a versioned image, and Kubernetes' rolling-update model, both embody immutable infrastructure — the running fleet is always a known, reproducible artifact.",
    pitfall:
      "Debugging a live production issue is harder without SSH access to poke around — observability (logs, metrics, tracing) has to actually be good enough to substitute.",
    fix:
      'Invest in centralized logging and metrics as a prerequisite for going immutable — without them, immutable infrastructure just removes your ability to debug without giving you anything better.',
  },
  {
    id: 'infrastructure-as-code',
    section: 'cloud',
    title: 'Infrastructure as Code',
    blurb: 'Defining cloud infrastructure (servers, networks, permissions) in version-controlled config files, applied by a tool — not clicked together by hand in a console.',
    tag: 'Cost & Observability',
    Component: demo({
      command: 'apply from code',
      before: [{ label: 'clicked together in the AWS console', sub: 'no record of exactly what was configured, or why', color: 'var(--bad)' }],
      after: [{ label: 'terraform apply', sub: "infrastructure matches what's in version control, reproducibly", color: 'var(--good)' }],
      note: {
        before: 'Manually-clicked infrastructure has no history — reproducing the same environment means clicking through it all again from memory.',
        after: 'The exact desired state lives in a reviewed, version-controlled file — reproducing the environment means re-running the known-correct definition.',
      },
    }),
    code: [{ lang: 'hcl', snippet: `resource "aws_instance" "web" {\n  ami           = "ami-0abc123"\n  instance_type = "t3.medium"\n  tags = { Name = "web-server" }\n}` }],
    realWorld:
      'Terraform, Pulumi, and CloudFormation all exist so infrastructure changes go through the same review, diff, and version-control process as application code.',
    pitfall:
      'Manual changes made directly in the console (a quick fix during an incident) silently drift real infrastructure away from what the IaC definition says — the next apply can revert that emergency fix.',
    fix:
      'Treat any manual console change as temporary and immediately codify it back into the IaC definition — or lock down console write access entirely.',
  },
  {
    id: 'spot-vs-reserved',
    section: 'cloud',
    title: 'Spot vs Reserved vs On-Demand Instances',
    blurb: 'Three ways to pay for the same compute: full price with no commitment (on-demand), a discount for committing ahead of time (reserved), or a deep discount for capacity that can be reclaimed anytime (spot).',
    tag: 'Cost & Observability',
    Component: demo({
      command: 'pick the right pricing model',
      before: [{ label: 'on-demand pricing for a stable, always-on fleet', sub: 'paying full price for fully predictable usage', color: 'var(--bad)' }],
      after: [{ label: 'reserved for baseline + spot for batch jobs', sub: 'up to 70-90% cheaper for the same work', color: 'var(--good)' }],
      note: {
        before: 'On-demand pricing is the most flexible but the most expensive per hour — wasteful for known, steady-state load.',
        after: 'Reserving known capacity ahead of time earns a discount; spot capacity for interruption-tolerant batch work is even cheaper still.',
      },
    }),
    code: [{ lang: 'bash', snippet: `# Reserved: commit to steady baseline capacity for a discount\naws ec2 purchase-reserved-instances-offering --instance-count 10 ...\n\n# Spot: bid for spare capacity, can be reclaimed with ~2min notice\naws ec2 request-spot-instances --instance-count 20 --spot-price "0.05"` }],
    realWorld:
      'Batch data processing and CI build fleets run almost entirely on spot instances for the discount; steady-state web servers run on reserved capacity for the predictable baseline.',
    pitfall:
      "Running a stateful, interruption-sensitive workload on spot instances means it can be forcibly terminated mid-work with only a couple minutes' notice.",
    fix:
      "Reserve spot instances for stateless, interruption-tolerant, or checkpointed workloads — anything that can't gracefully handle sudden termination belongs on reserved or on-demand capacity.",
  },
  {
    id: 'cost-tagging',
    section: 'cloud',
    title: 'Cost Allocation & Tagging',
    blurb: 'Labeling every cloud resource with metadata (team, project, environment) so spend can actually be attributed to whoever or whatever is responsible for it.',
    tag: 'Cost & Observability',
    Component: demo({
      command: 'tag every resource',
      before: [{ label: '$50,000/month bill', sub: 'no breakdown — which team, which project?', color: 'var(--bad)' }],
      after: [{ label: 'tagged: team=payments, env=prod → $12,000/mo', sub: 'attributable, per team, per environment', color: 'var(--good)' }],
      note: {
        before: "A single lump-sum bill gives no visibility into what's actually driving cost.",
        after: 'Consistent tags let the bill be sliced by team, project, or environment — cost ownership becomes visible and specific.',
      },
    }),
    code: [{ lang: 'bash', snippet: `aws ec2 run-instances ... --tag-specifications \\\n  'ResourceType=instance,Tags=[{Key=team,Value=payments},{Key=env,Value=prod}]'` }],
    realWorld:
      'Every organization running meaningful cloud spend uses tagging to build cost dashboards per team — the difference between "$50k, no idea why" and "payments-prod is $12k, up 15% this month, here\'s why".',
    pitfall:
      'Tagging enforced loosely (optional, inconsistent naming, no validation) results in a large fraction of untagged or inconsistently tagged resources, quietly breaking every cost report built on top.',
    fix:
      'Enforce required tags at resource-creation time (a policy that rejects untagged resources) rather than relying on developers remembering to tag consistently after the fact.',
  },
  {
    id: 'centralized-logging',
    section: 'cloud',
    title: 'Centralized Logging',
    blurb: 'Shipping logs from every server and service to one searchable place, instead of leaving them scattered across dozens of individual machines.',
    tag: 'Cost & Observability',
    Component: demo({
      command: 'ship logs centrally',
      before: [{ label: 'which of our 40 servers logged this error?', sub: 'SSH into each one and grep', color: 'var(--bad)' }],
      after: [{ label: "one query across all 40 servers' logs, in seconds", color: 'var(--good)' }],
      note: {
        before: 'Debugging an issue across a fleet means SSHing into servers one at a time, hoping to find the right one.',
        after: 'Every server ships its logs to one central, searchable index — one query finds relevant entries across the entire fleet.',
      },
    }),
    code: [{ lang: 'yaml', snippet: `logging:\n  driver: fluentd\n  destination: elasticsearch://logs.internal:9200\n  # every container/instance ships stdout/stderr here automatically` }],
    realWorld:
      'The ELK stack, Datadog, and CloudWatch Logs all exist for exactly this — once a fleet is more than a couple of servers, per-machine log-hunting stops being practical.',
    pitfall:
      'Logging everything at maximum verbosity, forever, with no retention policy turns the log store itself into a major, growing cost — and slows searching as the index balloons with noise.',
    fix:
      'Set log level appropriately per environment (verbose in staging, leaner in production) and apply a retention policy instead of keeping everything indexed forever.',
  },
  {
    id: 'distributed-tracing',
    section: 'cloud',
    title: 'Distributed Tracing',
    blurb: 'Following one request as it flows across many services, with a shared trace id, to see exactly where time was spent and where something failed.',
    tag: 'Cost & Observability',
    Component: demo({
      command: 'trace the request',
      before: [{ label: '"the API is slow" — which of 12 downstream services?', sub: 'unknown without tracing', color: 'var(--bad)' }],
      after: [{ label: 'gateway(5ms) → auth(8ms) → db(340ms) → cache(2ms)', sub: 'the database call is exactly where the time goes', color: 'var(--good)' }],
      note: {
        before: "A single slow request touches many services — without a way to follow it end to end, there's no way to know which is responsible.",
        after: "A shared trace id links every service's span of the same request — the exact hop that took 340ms is immediately visible.",
      },
    }),
    code: [{ lang: 'python', snippet: `with tracer.start_span("db_query", parent=current_span):\n    result = db.query(sql)\n# every span shares the request's trace_id, stitched together in the trace UI` }],
    realWorld:
      'Jaeger, Zipkin, and Datadog APM all implement this — any microservices architecture beyond a couple of services needs distributed tracing, since a request routinely crosses five or more boundaries.',
    pitfall:
      'Tracing every single request at 100% sampling generates a huge volume of trace data and real overhead — most of it never gets looked at.',
    fix:
      "Sample traces (e.g. 1-10% of normal traffic) while always tracing 100% of errors and unusually slow requests — full detail exactly where it's actually useful.",
  },
]
