function leniar_interpolation(start, end, percent) {
    return (1-percent)*start + percent*end;
}

function getIntersection_me(line1, line2) {
    const mn1 = line1[1].y - line1[0].y;
    const md1 = line1[1].x - line1[0].x;
    let m1;
    let c1;
    if (md1 == 0) {
        if (mn1 == 0) { const m1 = 'pnt'; }
        else { m1 = 'inf'; }
    } else {
        m1 = mn1/md1;
        c1 = line1[1].y - m1*line1[1].x;
    }
    
    let m2;
    let c2;
    const mn2 = line2[1].y - line2[0].y;
    const md2 = line2[1].x - line2[0].x;
    if (md2 == 0) {
        if (mn2 == 0) { const m2 = 'pnt'; }
        else { m2 = 'inf'; }
    } else {
        m2 = mn2/md2;
        c2 = line2[1].y - m2*line2[1].x;
    }
    
    if (m1 == m2) {
        if (m1 == 'pnt') {
            if ((line1[0].x == line2[0].x) && (line1[0].y == line2[0].y)) {
                // return 1;
                return line1[0];
            }
            return null;
        } else if (m1 == 'inf') {
            if (line1[0].x != line2[0].x) {
                return null;
            }
            const min1 = Math.min(line1[0].y, line1[1].y);
            const max1 = Math.max(line1[0].y, line1[1].y);
            const min2 = Math.min(line2[0].y, line2[1].y);
            const max2 = Math.max(line2[0].y, line2[1].y);
            if (min1 > max2 || max1 < min2) { return null; }

            // return 2;
            return {x: line1[0].x, y: [Math.max(min1, min2), Math.min(max1, max2)]};
        } else { return c1 == c2; }
    }

    if (m1 == 'pnt') {
        if (m2 != 'inf') {
            if (line1[0].y != m2*line1[0].x + c2) { return null; }
            if (line1[0].y < Math.min(line2[0].y, line2[1].y) || line1[0].y > Math.max(line2[0].y, line2[1].y)) { return null; }
            if (line1[0].x < Math.min(line2[0].x, line2[1].x) || line1[0].x > Math.max(line2[0].x, line2[1].x)) { return null; }
        } else {
            if (line1[0].x != line2[0].x) { return null; }
            if (line1[0].y > Math.max(line2[0].y, line2[1].y) || line1[0].y < Math.min(line2[0].y, line2[1].y)) { return null; }
        }
        // return 3;
        return line1[0];
    }
    if (m2 == 'pnt') {
        if (m1 != 'inf') {
            if (line1[0].y != m1*line1[0].x + c2) { return null; }
            if (line1[0].y < Math.min(line1[0].y, line1[1].y) || line1[0].y > Math.max(line1[0].y, line1[1].y)) { return null; }
            if (line1[0].x < Math.min(line1[0].x, line1[1].x) || line1[0].x > Math.max(line1[0].x, line1[1].x)) { return null; }
        } else {
            if (line1[0].x != line1[0].x) { return null; }
            if (line1[0].y > Math.max(line1[0].y, line1[1].y) || line1[0].y < Math.min(line1[0].y, line1[1].y)) { return null; }
        }
        // return 4;
        return line1[0];
    }

    if (m1 == 'inf') {
        let {x} = line1[0];
        let y = m2*x + c2;
        if (y < Math.min(line1[0].y, line1[1].y) || y > Math.max(line1[0].y, line1[1].y)) { return null; }
        if (y < Math.min(line2[0].y, line2[1].y) || y > Math.max(line2[0].y, line2[1].y)) { return null; }
        if (x < Math.min(line1[0].x, line1[1].x) || x > Math.max(line1[0].x, line1[1].x)) { return null; }
        if (x < Math.min(line2[0].x, line2[1].x) || x > Math.max(line2[0].x, line2[1].x)) { return null; }
        // return 5;
        return {x: x, y: y};
    }
    if (m2 == 'inf') {
        let {x} = line2[0];
        let y = m1*x + c1;
        // console.log(x, y)
        if (y < Math.min(line2[0].y, line2[1].y) || y > Math.max(line2[0].y, line2[1].y)) { return null; }
        if (y < Math.min(line1[0].y, line1[1].y) || y > Math.max(line1[0].y, line1[1].y)) { return null; }
        if (x < Math.min(line2[0].x, line2[1].x) || x > Math.max(line2[0].x, line2[1].x)) { return null; }
        if (x < Math.min(line1[0].x, line1[1].x) || x > Math.max(line1[0].x, line1[1].x)) { return null; }
        // return 6;
        return {x: x, y: y};
    }

    const x = (c2-c1)/(m1-m2);
    const y = m1*x + c1;

    if (x < Math.min(line1[0].x, line1[1].x) || x > Math.max(line1[0].x, line1[1].x)) { return null; }
    if (x < Math.min(line2[0].x, line2[1].x) || x > Math.max(line2[0].x, line2[1].x)) { return null; }
    if (y < Math.min(line1[0].y, line1[1].y) || y > Math.max(line1[0].y, line1[1].y)) { return null; }
    if (y < Math.min(line2[0].y, line2[1].y) || y > Math.max(line2[0].y, line2[1].y)) { return null; }

    // return 7;
    return {x: x, y: y};
}

function getIntersection(line1,line2){ 
    const A=line1[0];
    const B=line1[1];
    const C=line2[0];
    const D=line2[1];

    const tTop=(D.x-C.x)*(A.y-C.y)-(D.y-C.y)*(A.x-C.x);
    const uTop=(C.y-A.y)*(A.x-B.x)-(C.x-A.x)*(A.y-B.y);
    const bottom=(D.y-C.y)*(B.x-A.x)-(D.x-C.x)*(B.y-A.y);
    
    if(bottom!=0){
        const t=tTop/bottom;
        const u=uTop/bottom;
        if(t>=0 && t<=1 && u>=0 && u<=1){
            return {
                x:leniar_interpolation(A.x,B.x,t),
                y:leniar_interpolation(A.y,B.y,t),
                offset:t
            }
        }
    }

    return null;
}

function intersecting_polygons(lines1, lines2) {
    intersections = [];
    for (let i = 0; i < lines1.length; i++) {
        for (let j = 0; j < lines2.length; j++) {
            const intersection = getIntersection(lines1[i], lines2[j]);
            if (intersection) {
                intersections.push(intersection);
            }
        }
    }
    if (intersections.length == 0) { return null; }
    return intersections;
}