+++
title = "Delete All GitHub Actions Workflow Runs Using GitHub CLI"
description = "Wanna get rid of your actions?"
draft = false
date = "2026-06-26"

[taxonomies]
tags = ["github", "git"]

[extra]
math = false
+++

> [!NOTE]
> TLDR: Here's the one-liner if you're here to just copy it.
>
> <div class="fullwidth">
>
> ```console
> $ gh run list --all --limit 40 --json databaseId | jq '.[].databaseId' | xargs -n1 gh run delete
> ```
>
> </div>
>
> > [!CAUTION]
> > Change the limit, 40, to the actual number of actions present in your repository.

---


If you've ever accumulated hundreds (or thousands) of GitHub Actions workflow runs, you've probably wondered how to clean them all up.

To my knowledge, GitHub's web interface provides no interface for this purpose.
Unfortunately, there isn't also an obvious builtin GitHub CLI command, like `gh run delete --all`, that deletes every workflow run in a repository.
At best, the `gh run delete <run-id>` only deletes one workflow run as this command only accepts one argument (or none for an interactive selection before deletion).

If we could find a way to get a list of all runs, we then could wind up a for loop or pipe it to xargs to have them deleted programmatically.
For that, the following command

```console
$ gh run list
```

lists workflow runs in your repository.
By default, it only returns 20 workflow runs.
We can pass an extra `--limit <int>` flag to tell it list more.
{% marginnote(id="mn-1") %}
You can check how many workflow runs exist by visiting the <em>Actions</em> tab of your GitHub repository in your browser.
{% end %}
Additionally, we have pass `--all` (or `-a`) to include disabled workflows.

```console
$ gh run list --all --limit 100
```

Now, we need to extract the id's from the output, but the output format is in a human-readable/friendly way.
In other words, there's no fixed format so that we could parse it with `awk`, for instance.
Luckily, there's a `--json` flag that you can use to request only the fields/columns you need.
To see the list of correct field names, run

```console
$ gh run list --json
```

it will show use the various column names.
Among them exists the `databaseId`, which is what we want.
Issuing the following gives us a JSON output: a list of objects with only `databaseId` as key.
{% marginnote(id="mn-2") %}
Simply add more <code>--json<field></code> pairs to get more columns of data.
{% end %}


```console
$ gh run list --json databaseId
[
  {
    "databaseId": 1234567890
  },
  {
    "databaseId": 1234567891
  }
  ...
]
```

Now we need to turn that JSON into a plain list of IDs.
The easiest tool to pipe the JSON output into [`jq`](https://jqlang.org/).
{% marginnote(id="mn-3") %}
<code>.</code> refers to the root JSON value;
<code>[]</code> iterates over every element in the array; and
<code>.databaseId</code> selects the <code>databaseId</code> property from each object.
{% end %}

```console
$ gh run list --json databaseId | jq '.[].databaseId'
1234567890
1234567891
1234567892
...
```

Finally, we can go ahead and pipe the ids to `xargs` to get deleted one-by-one.
{% marginnote(id="mn-4") %}
The <code>-n1</code> option tells <code>xargs</code> to invoke <code>gh run delete</code> once for each input line.
{% end %}

```console
$ gh run list --json databaseId | jq '.[].databaseId' | xargs -n1 gh run delete
✓ Request to delete workflow run submitted.
✓ Request to delete workflow run submitted.
✓ Request to delete workflow run submitted.
...
```

This is yet another example of how powerful Unix philosophy can be.
