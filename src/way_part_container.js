module.exports = class WayPartContainer {
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
        let oneway = start.tags && start.tags.oneway == "yes"
        this.start = start
        this.oneway = oneway
        this.node_start = this.start.nodes[0]
        this.node_end = this.end.nodes[this.end.nodes.length - 1]
    }

    merge(to_join) {
        if (this.start.id != to_join.start.id) {
            if (this.node_end == to_join.node_start) {
                this.end.next = to_join.start
                to_join.start.last = this.end
                this.end = to_join.end
                this.node_end = this.end.nodes[this.end.nodes.length - 1]
                this.size += to_join.size
                return true
            } else if (!to_join.oneway && this.node_end == to_join.node_end) {
                to_join.reverse()
                this.end.next = to_join.end
                to_join.end.last = this.end
                this.end = to_join.start
                this.node_end = to_join.node_start
                this.size += to_join.size
                return true
            } else if (!to_join.oneway && this.node_start == to_join.node_start) {
                to_join.reverse()
                this.start.last = to_join.start
                to_join.start.next = this.start
                this.start = to_join.end
                this.node_start = to_join.node_end
                this.size += to_join.size
                return true
            }
        }

        return false
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

            if (tmp_next) {
                tmp_start.last = tmp_next
            } else {
                delete tmp_start.last
            }
            
            if (tmp_last) {
                tmp_start.next = tmp_last
            } else {
                delete tmp_start.next
            }
        } while (tmp_start_next)
    }
}