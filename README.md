# flat-rota
A web app/mobile app for flatmates to see/manage rotas and rotations for communal supplies.

# Creating a fair rota

The rota will be modelled as a queue as such:

`[a, b, c, d, ...]`

Where each letter is a user.

The queue should be manipulated differently depending on where the "updater" is in the queue.

In the example list:

`[a, b, c, d]`

If `a` updates the rota, `a` should simply be moved to the back of the queue as such:

`[b, c, d, a]`

This is the case for any element which is not the last element.

If now `a` were to update the rota again, we cannot simply move `a` to the end of the queue, as that will not take into account the "quantity" that `a` has updated by.

Therefore we must loop through each element in the list, and if it has not been seen before, append it to the end of the list (but before `a`).

The output would then be:

`[b, c, d, b, c, d, a]`

It is important to keep track of which entries we have seen, and not re-append them.