# NOTES


## Issues

marginnotes and sidenotes will get consumed by the subsequent alert/quote environment, if any, on mobile devices.
For now, a fix could be to use the following workaround:

```markdown
<p style="margin-bottom: 0;">
{% marginnote(id="", offset="-3em") %}
This kernel just prints a message from 8 GPU threads.
Also, in practice you should check the return value of <code>cudaDeviceSynchronize</code>.
{% end %}
</p>

<hr style="border: none; margin: 0;">

> [!NOTE]
> ...

```
