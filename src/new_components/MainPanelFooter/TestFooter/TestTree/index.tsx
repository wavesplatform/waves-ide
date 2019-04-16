// import React from 'react';
// import withStyles, { StyledComponentProps } from 'react-jss';
//
// import styles from './styles';
//
// import Tree from 'antd/lib/tree';
// import 'antd/lib/tree/style/css';
//
// import Card from 'antd/lib/card';
// import 'antd/lib/card/style/css';
//
// import TestItem from '../TestItem';
//
// interface IProps extends StyledComponentProps<keyof ReturnType<typeof styles>> {
//     compilationResult: any
// }
//
// interface IState {}
//
// class TestTree extends React.Component<IProps, IState> {
//     private renderTree = (items: any[]) => {
//         return items.map(((item, i) => {
//             if (item.suites || item.tests) {
//                 return (
//                     <Tree.TreeNode
//                         key={item.fullTitle()}
//                         title={
//                             <TestItem type={'suite'} title={item.title} fullTitle={item.fullTitle()}></TestItem>
//                         }
//                     >
//                         {item.tests && this.renderTree(item.tests)}
//                         {item.suites && this.renderTree(item.suites)}
//                     </Tree.TreeNode>
//                 );
//             }
//
//             return (
//                 <Tree.TreeNode
//                     title={
//                         <TestItem
//                             type={'test'}
//                             key={item.fullTitle()}
//                             title={item.title}
//                             fullTitle={item.fullTitle()}
//                         />
//                     }
//                 />
//             );
//         }));
//     };
//
//     render() {
//         const {
//             classes,
//             compilationResult
//         } = this.props;
//
//         return (
//             <div className={classes!.testTree}>
//                 <Card>
//                     <Tree
//                         defaultExpandAll={true}
//                     >
//                         {this.renderTree(compilationResult.tests)}
//                         {this.renderTree(compilationResult.suites)}
//                     </Tree>
//                 </Card>
//             </div>
//         );
//     }
// }
//
// export default withStyles(styles)(TestTree);
