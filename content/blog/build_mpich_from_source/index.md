+++
title = "Build MPICH from source"
description = "A quick guide to building, and installing MPICH from source, plus a clean way to switch between MPI implementations."
draft = false
date = "2026-07-03"

[taxonomies]
tags = ["hpc", "mpi", "mpich"]

[extra]
math = false
+++

MPICH{% sidenote(id="sn-1") %}The CH part of the name was derived from "Chameleon", which was a portable parallel programming library developed by William Gropp, one of the founders of MPICH. (<a target="_blank" href=https://en.wikipedia.org/wiki/MPICH#History>wikipedia</a>){% end %} is one of the most widely used MPI implementations.
Package managers often ship an old version, or one built without the options you need, so you might want to build it from source to meet the requirements of your project.
This guide covers that as well as setting up your shell so MPICH doesn't clash with other MPI installs like OpenMPI.

The steps should be pretty much the same on Linux, macOS, and BSD. I'll call out the differences where they matter.

---

## Prerequisites

You need a C compiler and `make`.

- **Linux**: install the usual toolchain, e.g. `build-essential` (Debian/Ubuntu).
- **macOS**: run `xcode-select --install` to get `clang` and `make`{% sidenote(id="sn-2") %}I'm not entirely sure, but I think xcode cli tools provide GNU make, so you should be fine.{% end %}. Note `cc` is `clang` here, not GCC.
- **BSD**: base `make` is BSD make, not GNU make, which MPICH's build needs. Install GNU make (usually the `gmake` package) and use `gmake` instead of `make` below.


## Download and extract

Grab the latest release tarball from the [MPICH downloads page](https://www.mpich.org/downloads/), then extract it:
{% marginnote(id="mn-2") %}You could also verify the checksum/signature provided on the <a href="https://www.mpich.org/static/downloads/">downloads index page</a>.{% end %}

```console
$ curl -LO https://www.mpich.org/static/downloads/4.2.3/mpich-4.2.3.tar.gz
$ tar -xzf mpich-4.2.3.tar.gz # Don't worry, it's not a tarbomb
$ cd mpich-4.2.3
```

<span></span>
{% marginnote(id="mn-2.5", offset="-4.4em") %}<a target="_blank" href="https://en.wikipedia.org/wiki/Tar_(computing)#Tarbomb" style="text-decoration: none;">💣</a>{% end %}

## Configure

```console
$ ./configure
```

By default this installs to `/usr/local`. To _keep_ MPICH separate from other MPI implementations, you could set a custom prefix:
{% marginnote(id="mn-3") %}<em>Prefix</em> is the base directory that everything gets installed into.{% end %}

```console
$ ./configure --prefix=/opt/mpich
```
<span></span>
{% marginnote(id="mn-4", offset="-3em") %}The rest of this guide uses <code>/opt/mpich</code> as prefix.{% end %}

You could add any other flags here. You could run `./configure --help` to get a full list of all possible flags.
Here are some useful ones:
- `--disable-cxx` / `--disable-fortran`: skip C++ or Fortran bindings if you don't need them.
- `--enable-fast=all,O3`: drop debug instrumentation for a production build.
- `CC=`, `CXX=`, `FC=`: pick a specific compiler, e.g. `CC=gcc-13 ./configure ...`.

> [!TIP]
> Run `./configure --help` for the full list of options.

## Build

```console
$ make 2>&1 | tee log.make
```

<span></span>
{% marginnote(id="mn-5", offset="-3em") %}Use <code>gmake</code> instead of <code>make</code> on BSD.{% end %}

> [!TIP]
> Speed things up with `make -j$(nproc)` on Linux or `make -j$(sysctl -n hw.ncpu)` on macOS/BSD.

## Install

```console
$ sudo make install | tee log.install
```

<span></span>
{% marginnote(id="mn-6", offset="-3em") %}You don't need to use <code>sudo</code> if the current user owns the prefix directory.{% end %}

> [!NOTE]
> You could skip `sudo` entirely, by giving the user ownership over the prefix directory: `sudo mkdir -p /opt/mpich && sudo chown $USER /opt/mpich`; then you would re-run `make install` without `sudo`.

## Verify

```console
$ /opt/mpich/bin/mpichversion
MPICH Version:      5.0.1
MPICH Release date: Fri Apr 10 09:45:31 AM CDT 2026
MPICH ABI:          18:1:6
MPICH Device:       ch4:ofi
MPICH configure:    --prefix=/opt/mpich
MPICH CC:           gcc   -fno-common   -O2
MPICH CXX:          g++   -O2
MPICH F77:          gfortran   -O2
MPICH FC:           gfortran   -O2
MPICH features:     threadcomm
```

```console
$ /opt/mpich/bin/mpicc -show
gcc -I/opt/mpich/include -L/opt/mpich/lib -lmpi -lpmpi
```

If both run cleanly, the install is good.

## Add it to your shell

The binaries aren't on your `PATH` yet:
{% marginnote(id="mn-7") %}<code>make install</code> only copies stuff to the prefix directory; it does not tell the OS or the compilers where they could find MPICH binaries and libraries. We need to update certain shell environment variables so that the correct compiler is selected for execution and the correct library for linking.{% end %}

```console
$ export PATH="/opt/mpich/bin:$PATH"
```

Putting it first ensures `mpicc`/`mpirun` resolve to this build, not another MPI implementation.

### Why not just add this to our shell config?

If you switch between MPI implementations often or use mostly an implementation other than MPICH, permanently prepending MPICH to `PATH` means it silently wins every time, which can cause mismatches between the library your code was built against and the one `mpirun` launches with.

Instead, treat it like a Python virtual environment: activate it only when needed.
Create `/opt/mpich/activate.sh`:

```bash,hl_lines=15-16 18, linenos
MPICH_OLD_PATH="$PATH"
export PATH="/opt/mpich/bin:$PATH"

if [ -n "$ZSH_VERSION" ]; then
    MPICH_OLD_PROMPT="$PROMPT"
    export PROMPT="(mpich) $PROMPT"
else
    MPICH_OLD_PROMPT="$PS1"
    export PS1="(mpich) $PS1"
fi

deactivate_mpich() {
    export PATH="$MPICH_OLD_PATH"

    if [ -n "$ZSH_VERSION" ]; then
        export PROMPT="$MPICH_OLD_PROMPT"
    else
        export PS1="$MPICH_OLD_PROMPT"
    fi

    unset MPICH_OLD_PATH
    unset MPICH_OLD_PROMPT
    unset -f deactivate_mpich
}
```

<span></span>
{% marginnote(id="mn-8", offset="-14em") %}zsh uses <code>PROMPT</code>, bash uses <code>PS1</code>; the script checks <code>$ZSH_VERSION</code> to set the right one. You could adapt it if you use fish or any other non-POSIX shells.{% end %}

Activate it in any shell session with:

```hl_lines=1 5
$ source /opt/mpich/activate.sh
(mpich) $ type -a mpicc
mpicc is /opt/mpich/bin/mpicc
mpicc is /opt/homebrew/bin/mpicc
(mpich) $ deactivate_mpich
$ type -a mpicc
mpicc is /opt/homebrew/bin/mpicc
```

<span></span>
{% marginnote(id="mn-9", offset="-10.3em") %}If that's too much typing, you could add an alias to your config, like <code>mpich5</code>.{% end %}
<span></span>
{% marginnote(id="mn-10", offset="-5.3em") %}<code>deactivate_mpich</code> restores <code>PATH</code> and the prompt to how they were before.{% end %}
