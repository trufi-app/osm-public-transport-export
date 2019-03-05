exports.WayPartContainer = class {
    constructor(end) {
        this.setValues(end)
        this.size = 1
    }
    toString() {
        return `way(${this.start.id});out geom;way(${this.end.id});out geom;`
    }
    setValues(end) {
        this.end = end
        let start = end
        let oneway = start.tags && start.tags.oneway && start.tags.oneway == "yes"
        this.start = start
        this.oneway = oneway
        this.node_start = this.start.nodes[0]
        this.node_end = this.end.nodes[this.end.nodes.length - 1]
    }
    merge(toJoin) {
        if (this.start.id != toJoin.start.id) {
            if (this.node_end == toJoin.node_start) {
                this.end.next = toJoin.start
                toJoin.start.last = this.end
                this.end = toJoin.end
                this.node_end = this.end.nodes[this.end.nodes.length - 1]
                this.size += toJoin.size
                return true
            } else if (!toJoin.oneway && this.node_end == toJoin.node_end) {
                toJoin.reverse()
                this.end.next = toJoin.end
                toJoin.end.last = this.end
                this.end = toJoin.start
                this.node_end = toJoin.node_start
                this.size += toJoin.size
                return true
            } else if (!toJoin.oneway && this.node_start == toJoin.node_start) {
                toJoin.reverse()
                this.start.last = toJoin.start
                toJoin.start.next = this.start
                this.start = toJoin.end
                this.node_start = toJoin.node_end
                this.size += toJoin.size
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }

    reverse() {
        let tmp_start_next = this.start
        do {
            let tmp_start = tmp_start_next
            tmp_start_next = tmp_start.next
            tmp_start.geometry.reverse()
            tmp_start.nodes.reverse()
            let tmp_next = tmp_start.next
            let tmp_last = tmp_start.last
            if (tmp_next)
                tmp_start.last = tmp_next
            else
                delete tmp_start.last
            if (tmp_last)
                tmp_start.next = tmp_last
            else
                delete tmp_start.next
        } while (tmp_start_next)
    }
}